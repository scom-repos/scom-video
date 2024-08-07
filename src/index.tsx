import {
  Module,
  customModule,
  IDataSchema,
  Container,
  ControlElement,
  customElements,
  Panel,
  Iframe,
  Control
} from '@ijstech/components'
import { IData } from './interface'
import dataJson from './data.json'
import './index.css'

interface ScomVideoElement extends ControlElement {
  lazyLoad?: boolean;
  url: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["i-scom-video"]: ScomVideoElement;
    }
  }
}

@customModule
@customElements('i-scom-video')
export default class ScomVideo extends Module {
  private data: IData = {
    url: ''
  };
  private pnlVideo: Panel
  private videoEl: any

  tag: any = {}

  defaultEdit?: boolean
  validate?: () => boolean
  edit: () => Promise<void>
  confirm: () => Promise<void>
  discard: () => Promise<void>

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  static async create(options?: ScomVideoElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get url() {
    return this.data.url ?? '';
  }
  set url(value: string) {
    this.data.url = value ?? '';
    this.updateVideo();
  }

  private get ism3u8() {
    const regex = /.*\.m3u8$/gi
    return regex.test(this.data?.url || '')
  }

  async init() {
    super.init();
    if (!this.onClick) this.onClick = (target: Control, event: Event) => event.stopPropagation();
    const width = this.getAttribute('width', true);
    const height = this.getAttribute('height', true);
    this.setTag({ width: width ? this.width : '480px', height: height ? this.height : '270px' });
    const lazyLoad = this.getAttribute('lazyLoad', true, false);
    if (!lazyLoad) {
      const url = this.getAttribute('url', true);
      if (url) await this.setData({ url });
    }
  }

  private getData() {
    return this.data
  }

  private async setData(value: IData) {
    this.data = value
    this.updateVideo()
  }

  private getUrl() {
    if (!this.data.url) return '';
    const videoId = this.getVideoId(this.data.url);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return this.data.url;
  }

  private getVideoId(url: string) {
    let regex = /(youtu.*be.*)\/(watch\?v=|watch\?.+&v=|live\/|shorts\/|embed\/|v\/|)(.*?((?=[&#?])|$))/gm;
    return regex.exec(url)?.[3] || url;
  }

  private updateVideo() {
    if (this.data.url.endsWith('.mp4') || this.data.url.endsWith('.mov')) {
      if (!this.videoEl || !(this.videoEl instanceof ScomVideo)) {
        this.videoEl = <i-video width={'100%'} height={'100%'} display='block'></i-video>

        this.pnlVideo.clearInnerHTML()
        this.pnlVideo.append(this.videoEl)
        this.videoEl.url = this.data.url;
      }
    }
    else if (this.ism3u8) {
      if (!this.videoEl || !(this.videoEl instanceof ScomVideo)) {
        this.videoEl = <i-video isStreaming={true} width={'100%'} height={'100%'} display='block'></i-video>

        this.pnlVideo.clearInnerHTML()
        this.pnlVideo.append(this.videoEl)
        this.videoEl.url = this.data.url;
      }
    }
    else {// should be YouTube
      if (!this.videoEl || !(this.videoEl instanceof Iframe)) {
        this.videoEl = <i-iframe width="100%" height="100%" display="flex" allowFullscreen={true}></i-iframe>

        this.pnlVideo.clearInnerHTML()
        this.pnlVideo.append(this.videoEl)
        this.videoEl.url = this.getUrl();
      }
    }
  }

  private getTag() {
    return this.tag
  }

  private async setTag(value: any) {
    this.tag = value;
  }

  getConfigurators(type?: 'defaultLinkYoutube' | 'defaultLinkMp4' | 'defaultLinkM3u8' | 'defaultLinkEmpty') {
    const self = this;
    return [
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: () => {
          return this._getActions();
        },
        getData: this.getData.bind(this),
        setData: async (data: IData) => {
          let defaultData = dataJson.defaultBuilderData4; //empty
          switch (type) {
            case 'defaultLinkYoutube':
              defaultData = dataJson.defaultBuilderData;
              break;
            case 'defaultLinkMp4':
              defaultData = dataJson.defaultBuilderData2;
              break;
            case 'defaultLinkM3u8':
              defaultData = dataJson.defaultBuilderData3;
              break;
          }
          await this.setData({ ...defaultData, ...data })
        },
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      },
      {
        name: 'Emdedder Configurator',
        target: 'Embedders',
        getActions: () => {
          return this._getActions();
        },
        getLinkParams: () => {
          const data = this.data || {};
          return {
            data: window.btoa(JSON.stringify(data))
          }
        },
        setLinkParams: async (params: any) => {
          if (params.data) {
            const utf8String = decodeURIComponent(params.data);
            const decodedString = window.atob(utf8String);
            const newData = JSON.parse(decodedString);
            let resultingData = {
              ...self.data,
              ...newData
            };
            await this.setData(resultingData);
          }
        },
        getData: this.getData.bind(this),
        setData: this.setData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      },
      {
        name: 'Editor',
        target: 'Editor',
        getActions: () => {
          return this._getActions()
        },
        setData: async (data: IData) => {
          const defaultData = dataJson.defaultBuilderData as any;
          await this.setData({ ...defaultData, ...data })
        },
        getData: this.getData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      }
    ]
  }

  private getPropertiesSchema() {
    const schema: IDataSchema = {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string",
          tooltip: "Examples:<br>YouTube full link: https://www.youtube.com/watch?v=dQw4w9WgXcQ,<br>YouTube video ID: dQw4w9WgXcQ<br>mp4 file: https://static.flot.ai/file/karavideo/happy-cat.mp4",
        }
      }
    };
    return schema;
  }

  private _getActions() {
    const propertiesSchema = this.getPropertiesSchema();
    const actions = [
      {
        name: 'Edit',
        icon: 'edit',
        command: (builder: any, userInputData: any) => {
          let oldData = { url: '' };
          return {
            execute: () => {
              oldData = { ...this.data };
              if (userInputData?.url) this.data.url = userInputData.url;
              this.updateVideo();
              if (builder?.setData) builder.setData(this.data);
            },
            undo: () => {
              this.data = { ...oldData };
              this.updateVideo();
              if (builder?.setData) builder.setData(this.data);
            },
            redo: () => { }
          }
        },
        userInputDataSchema: propertiesSchema as IDataSchema
      }
    ]
    return actions
  }

  render() {
    return (
      <i-panel id="pnlVideo" width={'100%'} height={'100%'}></i-panel>
    )
  }
}
