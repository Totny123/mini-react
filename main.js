const rootContainer = document.querySelector('#root');

const createTextNode = (text) => {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'string' ? createTextNode(child) : child;
      }),
    },
  };
};

const divEl = createElement('div', { id: 'app' }, 'hello', ' mini-react');

const render = (el, container) => {
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
    render(child, dom);
  });

  container.append(dom);
};

render(divEl, rootContainer);
