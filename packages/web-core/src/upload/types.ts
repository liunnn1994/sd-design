export type ListType = 'text' | 'picture' | 'picture-card';

export type FileStatus = 'init' | 'uploading' | 'done' | 'error';

export interface FileItem {
  /**
   * @zh 当前上传文件的唯一标示
   * @en The unique identifier of the currently uploaded file
   */
  uid: string;
  /**
   * @zh 当前上传文件的状态
   * @en The status of the currently uploaded file
   */
  status?: FileStatus;
  /**
   * @zh 文件对象
   * @en File object
   */
  file?: File;
  /**
   * @zh 上传进度百分比
   * @en Upload progress percentage
   */
  percent?: number;
  /**
   * @zh 当前文件上传请求返回的响应
   * @en The response returned by the current file upload request
   */
  response?: unknown;
  /**
   * @zh 文件地址
   * @en The file address
   */
  url?: string;
  /**
   * @zh 文件名
   * @en The file name
   */
  name?: string;
}

export interface RequestOption {
  /**
   * @zh 上传的URL
   * @en Uploaded URL
   * */
  action?: string;
  /**
   * @zh 请求报文的头信息
   * @en Header information of the request message
   * */
  headers?: Record<string, string>;
  /**
   * @zh 上传文件的文件名
   * @en File name of the uploaded file
   * */
  name?: string | ((fileItem: FileItem) => string);
  /**
   * @zh 上传文件
   * @en upload files
   * */
  fileItem: FileItem;
  /**
   * @zh 附加的请求信息
   * @en Additional requested information
   * */
  data?: Record<string, string | Blob> | ((fileItem: FileItem) => Record<string, string | Blob>);
  /**
   * @zh 是否携带cookie信息
   * @en Whether to carry cookie information
   * */
  withCredentials?: boolean;
  /**
   * @zh 更新当前文件的上传进度。percent: 当前上传进度百分比
   * @en Update the upload progress of the current file. percent: current upload progress percentage
   * */
  onProgress: (percent: number, event?: ProgressEvent) => void;
  /**
   * @zh 上传成功后，调用onSuccess方法，传入的response参数将会附加到当前上传文件的response字段上
   * @en After the upload is successful, call the onSuccess method, the incoming response parameter will be appended to the response field of the currently uploaded file
   * */
  onSuccess: (response?: unknown) => void;
  /**
   * @zh 上传失败后，调用onError方法，传入的response参数将会附加到当前上传文件的response字段上
   * @en After the upload fails, call the onError method, and the response parameter passed in will be appended to the response field of the currently uploaded file
   * */
  onError: (response?: unknown) => void;
}

export interface UploadRequest extends Record<string, unknown> {
  /**
   * @zh 终止上传
   * @en Terminate upload
   * */
  abort?: () => void;
}
