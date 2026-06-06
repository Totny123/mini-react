let nextWorkOfUnit = null;
// work in process （未提交，只是计算过程中的草稿）
let wipRoot = null;
// 真实DOM对应的fiber树（已提交）
let currentRoot = null;
let deletions = [];
let wipFiber = null;
let stateHooks;
let stateHookIndex;
let effectHooks;

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
  effectHooks = [];
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
    // wipRoot 是本轮子树更新的边界，不能继续走到它的兄弟节点。
    if (nextFiber === wipRoot) return;
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

const commitEffectHooks = () => {
  const run = (fiber) => {
    if (!fiber) return;
    // 没有alternate意味着是初始化
    if (!fiber.alternate) {
      fiber.effectHooks?.forEach((hook) => {
        hook.callback();
      });
    } else {
      // 非函数节点没有effectHooks，需要可选链?.
      fiber.effectHooks?.forEach((newHook, index) => {
        if (newHook.deps.length === 0) return;

        const oldHook = fiber.alternate?.effectHooks[index];
        const needUpdate = newHook.deps.some((dep, index) => {
          return dep !== oldHook.deps[index];
        });
        needUpdate && newHook.callback();
      });
    }

    run(fiber.child);
    run(fiber.sibling);
  };
  run(wipRoot);
};

const commitRoot = () => {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  commitEffectHooks();
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

const basicStateReducer = (state, action) => {
  return typeof action === 'function' ? action(state) : action;
};

// 从状态机角度看，state 是当前状态，queue 中的 update.action 是状态转移事件。
// 每次 render 按 hook 调用顺序stateHookIndex找到旧 hook，消费旧队列，把 old state 转移为 next state。
const useState = (initial) => {
  const currentFiber = wipFiber;
  const oldHook = currentFiber.alternate?.stateHooks?.[stateHookIndex];

  // 基于旧 hook 创建本轮 render 的新 hook；queue 用来接收下一批 update。
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };
  // render 阶段按入队顺序消费 update，得到本轮 render 使用的 state。
  oldHook?.queue?.forEach((update) => {
    stateHook.state = update.hasEagerState
      ? update.eagerState
      : basicStateReducer(stateHook.state, update.action);
  });
  // 挂到当前 fiber 上，作为下一轮状态转移的 old hook。
  currentFiber.stateHooks = stateHooks;
  currentFiber.stateHooks.push(stateHook);
  stateHookIndex++;

  const setState = (action) => {
    const update = {
      action,
      // 元信息
      hasEagerState: false,
      eagerState: null,
    };

    if (stateHook.queue.length === 0) {
      const eagerState = basicStateReducer(stateHook.state, action);
      if (eagerState === stateHook.state) return;

      update.hasEagerState = true;
      update.eagerState = eagerState;
    }

    // dispatch action：记录状态转移事件，并调度一次新的 render。
    stateHook.queue.push(update);

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };

  return [stateHook.state, setState];
};

const useEffect = (callback, deps) => {
  const effectHook = { callback, deps };
  effectHooks.push(effectHook);
  wipFiber.effectHooks = effectHooks;
};

const ReactDOM = {
  createRoot,
  update,
  useState,
  useEffect,
};

export default ReactDOM;
