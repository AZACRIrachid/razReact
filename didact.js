import {createElement} from './didact/vdom.js'
import {createDom} from './didact/dom.js'


let nextUnitOfWork = null
let wipRoot = null




function commitRoot(){

    commitWork(wipRoot.child)
    wipRoot = null
}

function commitWork(fiber){
    if(!fiber){
        return
    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}



function render(element,container){
wipRoot = {
    dom : container,
    props: {
        children: [element]
    }
}
nextUnitOfWork = wipRoot

}




function workLoop(deadline){
    let shouldYield = false
    while(nextUnitOfWork && !shouldYield){
       nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
       shouldYield = deadline.timeRemaining() < 1
    }
  //  console.log(deadline.timeRemaining())

    if(!nextUnitOfWork && wipRoot){
        commitRoot()
    }
    requestIdleCallback(workLoop)
}




requestIdleCallback(workLoop)





function performUnitOfWork (fiber){

    if(!fiber.dom){
        fiber.dom = createDom(fiber)
    }

    
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null
    
    while(index < elements.length){
        const element = elements[index]
        const newFiber = {
            type : element.type,
            props : element.props,
            parent : fiber,
            dom : null
        }
        if(index === 0 ){
            fiber.child = newFiber
        }else{
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber
        index++
    }


   console.log('fiber',fiber)

    if(fiber.child){
        return fiber.child
    }

    let nextFiber = fiber
    while(nextFiber){
        if(nextFiber.sibling){
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }

    return null
}

window.Didact = {
    createElement,
    render 
}



export default Didact