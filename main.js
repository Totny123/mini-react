const container = document.querySelector('#root');

// type
const el = document.createElement('div');
// props
el.id = 'app';
// children
container.append(el);

// type
const textNode = document.createTextNode('');
// props
textNode.nodeValue = 'app';
// children
el.append(textNode);
