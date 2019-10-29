let tagQueue = []

let onEvent = (ename, data)=>{
    tagQueue.push({
        ename, 
        data
    })
}

module.exports = {
    on:onEvent,
    getQueue: ()=>{
        return tagQueue;
    }
}