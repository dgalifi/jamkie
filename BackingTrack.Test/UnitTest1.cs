using System;
using System.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Backingtrack.Engine;
using Backingtrack.Engine.Models;
using NAudio.Wave;

namespace BackingTrack.Test
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TestMethod1()
        {
            var engine = new SoundEngine();

            using (MemoryStream metrBuffer = new MemoryStream())
            {
                var metronome = engine.GetMetronome(60, 1, metrBuffer);

                using (MemoryStream chordBuffer = new MemoryStream())
                {
                    var chord = engine.GetChord(Chord.C, 60, 1, chordBuffer);

                    using (var chord2Buffer = new MemoryStream())
                    {
                       // var chord2 = engine.GetChord(Chord.F, 60, 1, chordBuffer);

                       // var stream = engine.AttachStreams(chord, chord2, chord2Buffer);

                        File.WriteAllBytes(@"c:\temp\audio\output.mp3", engine.ToMp3(metronome.Mix(chord)).ToArray());
                    }
                }
            }
        }
    }
}
