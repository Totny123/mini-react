let nextWorkOfUnit = null;
// work in process
let wipRoot = null;
let prevRoot = null;

const createDOM = (type) => {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type);
};

const updateProps = (dom, nextProps, prevProps) => {
  Object.keys(prevProps).forEach((key) => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });
  Object.keys(nextProps).forEach((key) => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith('on')) {
          const eventType = key.slice(2).toLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  });
};

// 构建fiber链表的具体操作
const reconcileChildren = (fiber, children) => {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    // A函数组件内部嵌套B函数组件，要保持B函数组件引用稳定，否则整个B函数组件会重新渲染
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber = null;
    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        // 复用dom
        dom: oldFiber.dom,
        child: null,
        sibling: null,
        parent: fiber,
        // 记录对应的老fiber节点
        alternate: oldFiber,
        // 用于在commit阶段判断是新增还是更新
        effectTag: 'update',
      };
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        dom: null,
        child: null,
        sibling: null,
        parent: fiber,
        // type不一样即全新的节点，不需要保留旧节点的引用，跳过全新节点的子节点绑定操作
        alternate: null,
        effectTag: 'placement',
      };
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
    // 找到下一个旧的child
    oldFiber = oldFiber?.sibling;
  });
};

const updateFunctionComponent = (fiber) => {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
};

const updateHostComponent = (fiber) => {
  // 根节点已经有dom了，不需要处理
  if (!fiber.dom) {
    const dom = createDOM(fiber.type);
    fiber.dom = dom;
    updateProps(fiber.dom, fiber.props, {});
  }

  const children = fiber.props.children;
  reconcileChildren(fiber, children);
};

// 一边创建fiber对应的dom，一边构建后续链表，返回下一个fiber。
const performWorkOfUnit = (fiber) => {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  // 当前指针
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    // 没有sibling就将指针回退到父节点上
    nextFiber = nextFiber.parent;
  }
};

const commitRoot = () => {
  commitWork(wipRoot.child);
  prevRoot = wipRoot;
  wipRoot = null;
};

const commitWork = (fiber) => {
  if (!fiber) return;
  let fiberParent = fiber.parent;
  // 查找最近含有dom的祖先节点，避免函数组件嵌套
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === 'placement') {
    // 函数组件节点没有dom，跳过函数节点
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const workLoop = (deadline) => {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    if (!nextWorkOfUnit && wipRoot) {
      commitRoot();
    }
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
};

const createRoot = (container) => {
  return {
    render(app) {
      wipRoot = {
        dom: container,
        props: {
          children: [app],
        },
      };
      nextWorkOfUnit = wipRoot;
      requestIdleCallback(workLoop);
    },
  };
};

const update = () => {
  // 新的root fiber节点
  wipRoot = {
    dom: prevRoot.dom,
    props: prevRoot.props,
    // 记录好旧的fiber根节点，后续构建新的fiber链表时，通过children一一对应保存旧的fiber节点
    alternate: prevRoot,
  };
  nextWorkOfUnit = wipRoot;
};

const ReactDOM = {
  createRoot,
  update,
};

export default ReactDOM;
