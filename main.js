const rootContainer = document.querySelector('#root');

const textEl = {
  type: 'TEXT_ELEMENT',
  props: {
    nodeValue: 'app',
    children: [],
  },
};

const el = {
  type: 'div',
  props: {
    id: 'app',
    children: [textEl],
  },
};

const dom = document.createElement(el.type);
dom.id = el.props.id;
rootContainer.append(dom);

const textNode = document.createTextNode('');
textNode.nodeValue = textEl.props.nodeValue;
dom.append(textNode);
