import Recorder from 'recorder-core';
import 'recorder-core/src/engine/beta-amr';
import 'recorder-core/src/engine/beta-amr-engine';
import 'recorder-core/src/engine/beta-ogg';
import 'recorder-core/src/engine/beta-ogg-engine';
import 'recorder-core/src/engine/beta-webm';
import 'recorder-core/src/engine/g711x';
import 'recorder-core/src/engine/mp3';
import 'recorder-core/src/engine/mp3-engine';
import 'recorder-core/src/engine/pcm';
import 'recorder-core/src/engine/wav';
import 'recorder-core/src/extensions/asr.aliyun.short';
import 'recorder-core/src/extensions/buffer_stream.player';
import 'recorder-core/src/extensions/create-audio.nmn2pcm';
import 'recorder-core/src/extensions/lib.fft';
import 'recorder-core/src/extensions/dtmf.decode';
import 'recorder-core/src/extensions/dtmf.encode';
import 'recorder-core/src/extensions/frequency.histogram.view';
import 'recorder-core/src/extensions/sonic';
import 'recorder-core/src/extensions/wavesurfer.view';
import 'recorder-core/src/extensions/waveview';

export type RecorderCore = typeof Recorder;
export type RecorderCoreInstance = ReturnType<RecorderCore>;
export type RecorderCoreOptions = Parameters<RecorderCore>[0];

// 关闭首次实例化时向 51la 发送的流量统计埋点。
Recorder.TrafficImgUrl = '';

export default Recorder;
