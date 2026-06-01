const _render = (el, container) => {
  // 原生dom规范中，Text Node是特殊的节点
  const dom =
    el.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(el.type);

  Object.keys(el.props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = el.props[key];
    }
  });

  el.props.children.forEach((child) => {
    _render(child, dom);
  });

  container.append(dom);
};

const ReactDOM = {
  createRoot(container) {
    return {
      render(app) {
        _render(app, container);
      },
    };
  },
};

export default ReactDOM;
