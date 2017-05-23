using NAudio.Wave;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NAudio.Lame;
using NAudio.Wave.SampleProviders;
using Backingtrack.Engine.Models;

namespace Backingtrack.Engine
{
    public class SoundEngine : ISoundEngine
    {
        public void Combine(string[] inputFiles, Stream output)
        {
            foreach (var file in inputFiles)
            {
                Mp3FileReader reader = new Mp3FileReader(file);
                if ((output.Position == 0) && (reader.Id3v2Tag != null))
                {
                    output.Write(reader.Id3v2Tag.RawData, 0, reader.Id3v2Tag.RawData.Length);
                }
                Mp3Frame frame;
                while ((frame = reader.ReadNextFrame()) != null)
                {
                    output.Write(frame.RawData, 0, frame.RawData.Length);
                }
            }
        }

        public WaveStream GetMetronome(int tempo, int bars, Stream bufferStream)
        {
            Mp3FileReader stick = new Mp3FileReader(@"sounds\stick.mp3");
            Mp3FileReader stick2 = new Mp3FileReader(@"sounds\stick.mp3");

            //Wave
            WaveStream stickWave = WaveFormatConversionStream.CreatePcmStream(stick);
            WaveStream stick2Wave = WaveFormatConversionStream.CreatePcmStream(stick2);

            var stick32 = new WaveChannel32(stickWave);
            stick32.PadWithZeroes = false;
            stick32.Volume = 1.0f;

            double seconds = 60f / tempo;

            var stickOff = new WaveOffsetStream(stick2Wave, TimeSpan.FromSeconds(seconds), TimeSpan.Zero,
                stick2Wave.TotalTime);
            var stickOff32 = new WaveChannel32(stickOff);
            stickOff32.PadWithZeroes = false;
            stickOff32.Volume = 1.0f;

            // Add to the mixer.
            var mixer = new WaveMixerStream32();
            mixer.AutoStop = true;
            mixer.AddInputStream(stick32);
            mixer.AddInputStream(stickOff32);

            var outputWav = new Wave32To16Stream(mixer);

            using (MemoryStream mem = new MemoryStream())
            {
                WaveStream trimmed = TrimWaveStream(outputWav, TimeSpan.Zero,
                    outputWav.TotalTime.Subtract(TimeSpan.FromSeconds(seconds * 2)), mem);

                var looped = LoopStream(trimmed, bars * 2, bufferStream);
                return looped;
            }
        }

        public WaveStream GetChord(Chord chord, int tempo, int bars, Stream buffer)
        {
            string chordFile = @" C:\MyOnlineSolutions\randomChordGenerator\Backingtrack.Engine\sounds\maj7\C.wav";

            switch (chord)
            {
                case Chord.C:
                    chordFile = @" C:\MyOnlineSolutions\randomChordGenerator\Backingtrack.Engine\sounds\maj7\C.wav";
                    break;
                case Chord.F:
                    chordFile = @" C:\MyOnlineSolutions\randomChordGenerator\Backingtrack.Engine\sounds\maj7\F.wav";
                    break;
            }

            using (WaveFileReader reader = new WaveFileReader(chordFile))
            {
                double seconds = 60f / tempo;

                var chordStream = TrimWaveStream(reader, TimeSpan.Zero,
                    reader.TotalTime.Subtract(TimeSpan.FromSeconds(seconds * 2)), buffer);

                return LoopStream(chordStream, bars, buffer);
            }
        }

        public WaveStream LoopStream(WaveStream stream, int times, Stream memStream)
        {
            var bytes = new byte[stream.Length];
            stream.Read(bytes, 0, bytes.Length);

            for (int i = 0; i < times; i++)
            {
                memStream.Write(bytes, 0, bytes.Length);
            }

            var raw = new RawSourceWaveStream(memStream, stream.WaveFormat);
            raw.Position = 0;

            return raw;
        }

        public WaveStream AttachStreams(WaveStream stream1, WaveStream stream2, Stream memStream)
        {
            var bytes = new byte[stream1.Length + stream2.Length];
            stream1.Read(bytes, 0, (int)stream1.Length);
            stream2.Read(bytes, 0, (int)stream2.Length);

            var raw = new RawSourceWaveStream(memStream, stream1.WaveFormat);
            raw.Position = 0;

            return raw;
        }

        public MemoryStream ToMp3(WaveStream wavFile)
        {
            using (var retMs = new MemoryStream())
            using (var wtr = new LameMP3FileWriter(retMs, wavFile.WaveFormat, 128))
            {
                wavFile.CopyTo(wtr);
                return retMs;
            }
        }

        public MemoryStream ToMp3(byte[] wavbytes, WaveFormat format)
        {
            using (var retMs = new MemoryStream())
            {
                using (var wtr = new LameMP3FileWriter(retMs, format, 128))
                {
                    wtr.Write(wavbytes, 0, wavbytes.Length);
                    return retMs;
                }
            }
        }

        public WaveStream TrimWaveStream(WaveStream input, TimeSpan cutFromStart, TimeSpan cutFromEnd, Stream stream)
        {
            int bytesPerMillisecond = input.WaveFormat.AverageBytesPerSecond / 1000;

            int startPos = (int)cutFromStart.TotalMilliseconds * bytesPerMillisecond;
            startPos = startPos - startPos % input.WaveFormat.BlockAlign;

            int endBytes = (int)cutFromEnd.TotalMilliseconds * bytesPerMillisecond;
            endBytes = endBytes - endBytes % input.WaveFormat.BlockAlign;
            int endPos = (int)input.Length - endBytes;

            input.Position = startPos;
            byte[] buffer = new byte[1024];

            while (input.Position < endPos)
            {
                int bytesRequired = (int)(endPos - input.Position);
                if (bytesRequired > 0)
                {
                    int bytesToRead = Math.Min(bytesRequired, buffer.Length);
                    int bytesRead = input.Read(buffer, 0, bytesToRead);
                    if (bytesRead > 0)
                    {
                        stream.Write(buffer, 0, bytesRead);
                    }
                    else
                    {
                        stream.Write(new byte[(int)(endPos - input.Position)], 0, (int)(endPos - input.Position));
                        break;
                    }
                }
            }

            var raw = new RawSourceWaveStream(stream, input.WaveFormat);
            raw.Position = 0;

            return raw;
        }

        private void TrimWavFile(string inPath, string outPath, TimeSpan cutFromStart, TimeSpan cutFromEnd)
        {
            using (WaveFileReader reader = new WaveFileReader(inPath))
            {
                using (WaveFileWriter writer = new WaveFileWriter(outPath, reader.WaveFormat))
                {
                    int bytesPerMillisecond = reader.WaveFormat.AverageBytesPerSecond / 1000;

                    int startPos = (int)cutFromStart.TotalMilliseconds * bytesPerMillisecond;
                    startPos = startPos - startPos % reader.WaveFormat.BlockAlign;

                    int endBytes = (int)cutFromEnd.TotalMilliseconds * bytesPerMillisecond;
                    endBytes = endBytes - endBytes % reader.WaveFormat.BlockAlign;
                    int endPos = (int)reader.Length - endBytes;

                    TrimWavFile(reader, writer, startPos, endPos);
                }
            }
        }

        private void TrimWavFile(WaveFileReader reader, WaveFileWriter writer, int startPos, int endPos)
        {
            reader.Position = startPos;
            byte[] buffer = new byte[1024];
            while (reader.Position < endPos)
            {
                int bytesRequired = (int)(endPos - reader.Position);
                if (bytesRequired > 0)
                {
                    int bytesToRead = Math.Min(bytesRequired, buffer.Length);
                    int bytesRead = reader.Read(buffer, 0, bytesToRead);
                    if (bytesRead > 0)
                    {
                        writer.WriteData(buffer, 0, bytesRead);
                    }
                }
            }
        }
    }

    public static class WaveStreamExtension
    {
        public static WaveStream Mix(this WaveStream stream, WaveStream stream2)
        {
            var mixer = new WaveMixerStream32();
            mixer.AutoStop = true;

            var chann1 = new WaveChannel32(stream);
            chann1.PadWithZeroes = false;
            chann1.Volume = 1.0f;

            var chann2 = new WaveChannel32(stream2);
            chann2.PadWithZeroes = false;
            chann2.Volume = 1.0f;

            mixer.AddInputStream(chann1);
            mixer.AddInputStream(chann2);

            return mixer;
        }
    }
}
