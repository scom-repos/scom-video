/// <amd-module name="@scom/scom-video/interface.ts" />
declare module "@scom/scom-video/interface.ts" {
    import { IDataSchema } from "@ijstech/components";
    export interface ICommand {
        execute(): void;
        undo(): void;
        redo(): void;
    }
    export interface IPageBlockAction {
        name: string;
        icon: string;
        command: (builder: any, userInputData: any) => ICommand;
        userInputDataSchema: IDataSchema;
    }
    export interface IData {
        url: string;
        showHeader?: boolean;
        showFooter?: boolean;
    }
}
/// <amd-module name="@scom/scom-video/data.json.ts" />
declare module "@scom/scom-video/data.json.ts" {
    const _default: {
        ipfsGatewayUrl: string;
        defaultBuilderData: {
            url: string;
        };
    };
    export default _default;
}
/// <amd-module name="@scom/scom-video/index.css.ts" />
declare module "@scom/scom-video/index.css.ts" { }
/// <amd-module name="@scom/scom-video" />
declare module "@scom/scom-video" {
    import { Module, IDataSchema, Container, ControlElement } from '@ijstech/components';
    import { IData } from "@scom/scom-video/interface.ts";
    import "@scom/scom-video/index.css.ts";
    interface ScomVideoElement extends ControlElement {
        lazyLoad?: boolean;
        url: string;
        showHeader?: boolean;
        showFooter?: boolean;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ["i-scom-video"]: ScomVideoElement;
            }
        }
    }
    export default class ScomVideo extends Module {
        private data;
        private iframeElm;
        private dappContainer;
        tag: any;
        defaultEdit?: boolean;
        validate?: () => boolean;
        edit: () => Promise<void>;
        confirm: () => Promise<void>;
        discard: () => Promise<void>;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomVideoElement, parent?: Container): Promise<ScomVideo>;
        get url(): string;
        set url(value: string);
        get showFooter(): boolean;
        set showFooter(value: boolean);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        init(): void;
        private getData;
        private setData;
        private getUrl;
        getVideoId(url: string): string;
        private getTag;
        private setTag;
        getConfigurators(): ({
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: IDataSchema;
            }[];
            getData: any;
            setData: (data: IData) => Promise<void>;
            getTag: any;
            setTag: any;
            getLinkParams?: undefined;
            setLinkParams?: undefined;
        } | {
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: IDataSchema;
            }[];
            getLinkParams: () => {
                data: string;
            };
            setLinkParams: (params: any) => Promise<void>;
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
        })[];
        private getPropertiesSchema;
        private getThemeSchema;
        private _getActions;
        render(): any;
    }
}
