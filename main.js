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
      children,
    },
  };
};

const textEl = createTextNode('app');

const el = createElement('div', { id: 'app' }, textEl);

const dom = document.createElement(el.type);
dom.id = el.props.id;
rootContainer.append(dom);

const textNode = document.createTextNode('');
textNode.nodeValue = textEl.props.nodeValue;
dom.append(textNode);
