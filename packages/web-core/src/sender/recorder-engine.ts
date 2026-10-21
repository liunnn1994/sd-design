import Recorder from './recorder-base.js';
import 'recorder-core/src/engine/beta-amr.js';
import 'recorder-core/src/engine/beta-amr-engine.js';
import 'recorder-core/src/engine/beta-ogg.js';
import 'recorder-core/src/engine/beta-ogg-engine.js';
import 'recorder-core/src/engine/beta-webm.js';
import 'recorder-core/src/engine/g711x.js';
import 'recorder-core/src/engine/mp3.js';
import 'recorder-core/src/engine/mp3-engine.js';
import 'recorder-core/src/engine/pcm.js';
import 'recorder-core/src/engine/wav.js';
import 'recorder-core/src/extensions/asr.aliyun.short.js';
import 'recorder-core/src/extensions/buffer_stream.player.js';
import 'recorder-core/src/extensions/create-audio.nmn2pcm.js';
import 'recorder-core/src/extensions/lib.fft.js';
import 'recorder-core/src/extensions/dtmf.decode.js';
import 'recorder-core/src/extensions/dtmf.encode.js';
import 'recorder-core/src/extensions/frequency.histogram.view.js';
import 'recorder-core/src/extensions/sonic.js';
import 'recorder-core/src/extensions/wavesurfer.view.js';
import 'recorder-core/src/extensions/waveview.js';

export type RecorderCore = typeof Recorder;
export type RecorderCoreInstance = ReturnType<RecorderCore>;
export type RecorderCoreOptions = Parameters<RecorderCore>[0];

export default Recorder;
