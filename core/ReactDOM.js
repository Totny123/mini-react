let nextWorkOfUnit = null;
// work in process （未提交，只是计算过程中的草稿）
let wipRoot = null;
// 真实DOM对应的fiber树（已提交）
let currentRoot = null;
let deletions = [];
let wipFiber = null;
let stateHooks;
let stateHookIndex;

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
      // 跳过false null等空节点
      if (child) {
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

      // 记录要删除的旧节点
      oldFiber && deletions.push(oldFiber);
    }

    if (newFiber) {
      if (prevChild) {
        // 非第一个子节点
        prevChild.sibling = newFiber;
      } else {
        // 第一个子节点
        fiber.child = newFiber;
      }
      prevChild = newFiber;
    }

    // 找到下一个旧的child
    oldFiber = oldFiber?.sibling;
  });

  // 旧children中多余的child节点需要删除
  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
};

const updateFunctionComponent = (fiber) => {
  stateHooks = [];
  stateHookIndex = 0;
  wipFiber = fiber;
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

const commitDeletion = (fiber) => {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    // 函数组件没有dom，实际要删除的是child
    commitDeletion(fiber.child);
  }
};

const commitRoot = () => {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
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
    // 说明是某个子树触发了更新，跳过不必要的更新
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = null;
    }
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
  // 双重闭包：第一层闭包记录函数组件对应的fiber
  const currentFiber = wipFiber;
  // 第二层闭包：使用fiber
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };
};

const useState = (initial) => {
  const currentFiber = wipFiber;
  const oldHook = currentFiber?.alternate?.stateHooks?.[stateHookIndex];
  // 拿到旧fiber的旧状态计算出新fiber的新状态
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
  };
  stateHookIndex++;
  stateHooks.push(stateHook);
  currentFiber.stateHooks = stateHooks;

  const setState = (action) => {
    // 改了旧fiber的状态，这个实现不太好。应该添加更新事件，由新fiber自行计算新状态
    stateHook.state = action(stateHook.state);

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };

  return [stateHook.state, setState];
};

const ReactDOM = {
  createRoot,
  update,
  useState,
};

export default ReactDOM;
