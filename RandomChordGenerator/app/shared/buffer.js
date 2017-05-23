var bufferLoader;
var context;

function AudioBuffer(sounds, afterLoad, onError) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    var buffer = this;
    bufferLoader = new BufferLoader(context, sounds,
        function onLoad(bufferList) {
            buffer.sources = {};
            buffer.bufferList = bufferList;

            afterLoad();
        }, onError);

    bufferLoader.load();
}



AudioBuffer.prototype.play = function (soundName, beat, tempo, bar, offset) {
    if (this.closed) {
        context = new AudioContext();
        console.log('created');
        this.closed = false;
    }

    this.sources[soundName] = context.createBufferSource();
    this.sources[soundName].buffer = this.bufferList[soundName];
    this.sources[soundName].connect(context.destination);

    var startTime = context.currentTime + offset;
    var sixthNote = (60 / tempo) / 4;
    var time = startTime + ((beat - 1) * sixthNote) + (bar * 4 * 60 / tempo);
    this.sources[soundName].start(time);
};

AudioBuffer.prototype.stop = function() {
    console.log('stop');
    context.close();
    this.closed = true;
}



function BufferLoader(context, sounds, callback, error) {
    this.context = context;
    this.sounds = sounds;
    this.onload = callback;
    this.error = error;
    this.bufferList = {};
    this.loadCount = 0;
}


BufferLoader.prototype.load = function () {
    for (var key in this.sounds) {

        // skip loop if the property is from prototype
        if (!this.sounds.hasOwnProperty(key))
            continue;

        this.loadBuffer(this.sounds[key], key);
    }
}


BufferLoader.prototype.loadBuffer = function (url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url , true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;

                var count = 0;
                for (var k in loader.sounds) {
                    if (loader.sounds.hasOwnProperty(k)) {
                        ++count;
                    }
                }

                if (++loader.loadCount == count)
                    loader.onload(loader.bufferList);
            },

            function (error) {
                loader.error();
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
        loader.error();
    }

    request.send();
}

module.exports = AudioBuffer;