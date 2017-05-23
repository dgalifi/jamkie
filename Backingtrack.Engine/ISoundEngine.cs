using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Backingtrack.Engine.Models;
using NAudio.Wave;

namespace Backingtrack.Engine
{
    public interface ISoundEngine
    {
        void Combine(string[] inputFiles, Stream output);

        WaveStream GetMetronome(int tempo, int bars, Stream bufferStream);

        WaveStream LoopStream(WaveStream stream, int times, Stream memStream);

        WaveStream GetChord(Chord chord, int tempo, int bars, Stream buffer);

        WaveStream AttachStreams(WaveStream stream1, WaveStream stream2, Stream memStream);

        MemoryStream ToMp3(WaveStream wavFile);
    }
}
