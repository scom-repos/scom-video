var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-video/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-video/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-video/data.json.ts'/> 
    exports.default = {
        "ipfsGatewayUrl": "https://ipfs.scom.dev/ipfs/",
        "defaultBuilderData": {
            "url": "https://www.youtube.com/embed/Wlf1T5nrO50"
        }
    };
});
define("@scom/scom-video/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_1.Styles.Theme.ThemeVars;
    components_1.Styles.cssRule('i-scom-video', {
        $nest: {
            '#pnlModule': {
                height: '100%'
            },
            '.video-js  .vjs-big-play-button': {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }
        }
    });
});
define("@scom/scom-video", ["require", "exports", "@ijstech/components", "@scom/scom-video/data.json.ts", "@scom/scom-video/index.css.ts"], function (require, exports, components_2, data_json_1) {
    "use strict";
    var ScomVideo_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let ScomVideo = ScomVideo_1 = class ScomVideo extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this.data = {
                url: ''
            };
            this.tag = {};
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get url() {
            return this.data.url ?? '';
        }
        set url(value) {
            this.data.url = value ?? '';
            this.updateVideo();
        }
        get ism3u8() {
            const regex = /.*\.m3u8$/gi;
            return regex.test(this.data?.url || '');
        }
        async init() {
            super.init();
            if (!this.onClick)
                this.onClick = (target, event) => event.stopPropagation();
            const width = this.getAttribute('width', true);
            const height = this.getAttribute('height', true);
            this.setTag({ width: width ? this.width : '480px', height: height ? this.height : '270px' });
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const url = this.getAttribute('url', true);
                const showHeader = this.getAttribute('showHeader', true, false);
                const showFooter = this.getAttribute('showFooter', true, false);
                await this.setData({ url, showFooter, showHeader });
            }
        }
        getData() {
            return this.data;
        }
        async setData(value) {
            this.data = value;
            this.updateVideo();
        }
        getUrl() {
            if (!this.data.url)
                return '';
            const videoId = this.getVideoId(this.data.url);
            if (videoId)
                return `https://www.youtube.com/embed/${videoId}`;
            return this.data.url;
        }
        getVideoId(url) {
            let regex = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
            return regex.exec(url)?.[3];
        }
        updateVideo() {
            if (this.data.url.endsWith('.mp4')) {
                if (!this.videoEl || !(this.videoEl instanceof ScomVideo_1)) {
                    this.videoEl = this.$render("i-video", { width: '100%', height: '100%', display: 'block' });
                }
            }
            else if (this.ism3u8) {
                if (!this.videoEl || !(this.videoEl instanceof ScomVideo_1)) {
                    this.videoEl = this.$render("i-video", { isStreaming: true, width: '100%', height: '100%', display: 'block' });
                }
            }
            else {
                if (!this.videoEl || !(this.videoEl instanceof components_2.Iframe)) {
                    this.videoEl = this.$render("i-iframe", { width: "100%", height: "100%", display: "flex" });
                }
            }
            this.pnlVideo.clearInnerHTML();
            this.pnlVideo.append(this.videoEl);
            this.videoEl.url = this.ism3u8 ? this.data.url : this.getUrl();
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.tag = value;
        }
        getConfigurators() {
            const self = this;
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: () => {
                        return this._getActions();
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData({ ...defaultData, ...data });
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
                        };
                    },
                    setLinkParams: async (params) => {
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
                        return this._getActions();
                    },
                    getLink: this.getLink.bind(this),
                    setLink: (value) => {
                        const utf8String = decodeURIComponent(value);
                        const decodedString = window.atob(utf8String);
                        const newData = JSON.parse(decodedString);
                        let resultingData = {
                            ...self.data,
                            ...(newData.properties || {})
                        };
                        this.setData(resultingData);
                    },
                    setData: this.setData.bind(this),
                    getData: this.getData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
        }
        getLink() {
            const encodedWidgetDataString = window.btoa(JSON.stringify(this._getWidgetData()));
            const loaderUrl = `https://ipfs.scom.dev/ipfs/bafybeia442nl6djz7qipnfk5dxu26pgr2xgpar7znvt3aih2k6nxk7sib4`;
            return `${loaderUrl}?data=${encodedWidgetDataString}`;
        }
        _getWidgetData() {
            return {
                "module": {
                    "name": "@scom/scom-video",
                    "localPath": "scom-video"
                },
                "properties": {
                    ...(this.data || {})
                }
            };
        }
        getPropertiesSchema() {
            const schema = {
                type: "object",
                required: ["url"],
                properties: {
                    url: {
                        type: "string"
                    }
                }
            };
            return schema;
        }
        _getActions() {
            const propertiesSchema = this.getPropertiesSchema();
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = { url: '' };
                        return {
                            execute: () => {
                                oldData = { ...this.data };
                                if (userInputData?.url)
                                    this.data.url = userInputData.url;
                                this.updateVideo();
                                if (builder?.setData)
                                    builder.setData(this.data);
                            },
                            undo: () => {
                                this.data = { ...oldData };
                                this.updateVideo();
                                if (builder?.setData)
                                    builder.setData(this.data);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: propertiesSchema
                }
            ];
            return actions;
        }
        render() {
            return (this.$render("i-panel", { id: "pnlVideo", width: '100%', height: '100%' }));
        }
    };
    ScomVideo = ScomVideo_1 = __decorate([
        components_2.customModule,
        (0, components_2.customElements)('i-scom-video')
    ], ScomVideo);
    exports.default = ScomVideo;
});
