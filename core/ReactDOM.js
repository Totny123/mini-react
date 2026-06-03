let nextWorkOfUnit = null;
let rootWorkOfUnit = null;

const createDOM = (type) => {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type);
};

const updateProps = (dom, props) => {
  Object.keys(props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  });
};

// 构建fiber链表的具体操作
const initChildren = (fiber, children) => {
  let prevChild = null;
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      dom: null,
      child: null,
      sibling: null,
      parent: fiber,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
};

// 一边创建fiber对应的dom，一边构建后续链表，返回下一个fiber。
const performWorkOfUnit = (fiber) => {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (!isFunctionComponent && !fiber.dom) {
    const dom = createDOM(fiber.type);
    fiber.dom = dom;
    updateProps(dom, fiber.props);
  }

  const children = isFunctionComponent
    ? [fiber.type(fiber.props)]
    : fiber.props.children;
  initChildren(fiber, children);

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
  commitWork(rootWorkOfUnit.child);
  // 删除旧的fiber树
  rootWorkOfUnit = null;
};

const commitWork = (fiber) => {
  if (!fiber) return;
  let fiberParent = fiber.parent;
  // 查找最近含有dom的祖先节点，避免函数组件嵌套
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  // 函数组件节点没有dom，跳过函数节点
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const workLoop = (deadline) => {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    if (!nextWorkOfUnit && rootWorkOfUnit) {
      commitRoot();
    }
    shouldYield = deadline.timeRemaining() < 5;
  }
  requestIdleCallback(workLoop);
};

const ReactDOM = {
  createRoot(container) {
    return {
      render(app) {
        nextWorkOfUnit = {
          dom: container,
          props: {
            children: [app],
          },
        };
        rootWorkOfUnit = nextWorkOfUnit;
        requestIdleCallback(workLoop);
      },
    };
  },
};

export default ReactDOM;
