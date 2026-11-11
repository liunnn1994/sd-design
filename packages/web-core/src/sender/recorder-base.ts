import RecorderModule from 'recorder-core';

// Name the SDK's declared default explicitly so NodeNext consumers do not infer a namespace.
const Recorder: (typeof import('recorder-core'))['default'] = RecorderModule;

// 独立依赖模块保证 SDK 初始化先于依赖其全局注册的格式/扩展模块执行。
// 关闭首次实例化时的流量统计。
Recorder.TrafficImgUrl = '';

export default Recorder;
