export const useVisualizerClient = () =>
    useState<any>('scene',()=>({
        scene:null,
        ctx:null,
    }))
