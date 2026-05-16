declare module "bpmn-js/lib/NavigatedViewer" {
  export default class BpmnViewer {
    constructor(options?: unknown);
    importXML(xml: string): Promise<unknown>;
    destroy(): void;
    get(module: string): unknown;
  }
}

declare module "bpmn-js" {
  export default class BpmnViewer {
    constructor(options?: unknown);
    importXML(xml: string): Promise<unknown>;
    destroy(): void;
    get(module: string): unknown;
  }
}
