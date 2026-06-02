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

const initChildren = (fiber) => {
  let prevChild = null;
  fiber.props.children.forEach((child, index) => {
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

const performWorkOfUnit = (fiber) => {
  if (!fiber.dom) {
    const dom = createDOM(fiber.type);
    fiber.dom = dom;
    updateProps(dom, fiber.props);
  }

  initChildren(fiber);

  if (fiber.child) {
    return fiber.child;
  }

  if (fiber.sibling) {
    return fiber.sibling;
  }

  if (fiber.parent?.sibling) {
    return fiber.parent.sibling;
  }
};

const commitRoot = () => {
  commitWork(rootWorkOfUnit.child);
  // 删除旧的fiber树
  rootWorkOfUnit = null;
};

const commitWork = (fiber) => {
  if (!fiber) return;
  fiber.parent.dom.append(fiber.dom);
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
