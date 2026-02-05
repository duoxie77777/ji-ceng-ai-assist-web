const iconMap: Record<string, string> = {
    Word: "qiweizaixianwendang-fill",
    Excel: "qiweizaixianbiaoge-fill",
    PPT: "qiweiyanshiwengao-fill",
    CollectionForm: "qiweishoujibiao-fill",
    FlowChart: "qiweiliuchengtu-fill",
    MindMap: "qiweisiweidaotu-fill",
}
const DEFAULT_ICON = "qitawenjian-fill"

const routeMap: Record<string, string> = {
    Word: '/document/word',
    Excel: '/document/excel',
    PPT: '/document/ppt',
    CollectionForm: '/document/collectionform',
    FlowChart: '/document/flowchart',
    MindMap: '/document/mindmap',
}
const DEFAULT_ROUTE = "/document"

// 分配图标
export const assignIcon = (type: string): string => {
    return iconMap[type] ?? DEFAULT_ICON
}

// 分配路由
export const assignRoute = (type: string): string => {
    return routeMap[type] ?? DEFAULT_ROUTE
}