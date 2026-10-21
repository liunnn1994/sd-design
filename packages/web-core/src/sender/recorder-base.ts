import Recorder from 'recorder-core';

// 独立依赖模块保证 SDK 初始化先于依赖其全局注册的格式/扩展模块执行。
// 关闭首次实例化时的流量统计。
Recorder.TrafficImgUrl = '';

export default Recorder;
