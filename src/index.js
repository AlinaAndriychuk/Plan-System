import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

function Colorpalette(props) {
  const color = useRef(null)
  const colorIndexes = [0, 1, 2, 3, 4, 5];
  const [colored, setColored] = useState(true);
  function showPalette(){
    setColored(false)
  }
  let styleForColor = {}
  let arrayOfColors = ["#ffffff", "#d6ebff", "#ecccff", "#ffaec2", "#d6fff6", "#fbffc7"];
  for (let i = 0; i < 6; i++){
    styleForColor[i] = {
      backgroundColor: arrayOfColors[i],
    }
  }

  function changeBackground(index) {
    props.colorFunction(props.blockfieldContext, arrayOfColors[index], props.BlockfieldIndex)
    setColored(true)
  }
  
  function renderPaletteBlock (){
    return (
      <button className="planner__palette-button">
        {
          colorIndexes.map ((item) => {
            return (<div onClick={()=> changeBackground(item)} ref={color} style={styleForColor[item]} className='planner__palette' key = {item} index={item}></div>)
          })
        }
      </button>
    )
  }
  function renderBrushBlock (){
    return (
      <button onClick={showPalette} className=" planner__task-button--absolute">
        <img className="planner__image" src="img/brush.png" alt="color pallet"/>
      </button>
    )
  }

  if (colored){
    return renderBrushBlock();
  } else {
    return renderPaletteBlock();
  }
}

function Block(props) {
  
  const [edited, setEdited] = useState(false);
  const textarea = useRef(null)

  function edit() {
    setEdited(false)
  }
  function remove() {
    props.deleteFunction(props.context, props.index)
  }
  function save(){
    let newValue = textarea.current.value;
    setEdited(true)
    props.updateFunction(props.context, newValue, props.index)
  }
  function renderNormalBlock (){
    return (
      <div className="planner__task">
        <textarea autoFocus ref={textarea} placeholder={props.taskName} className="planner__textarea"></textarea>
        <button onClick={save} className="planner__task-button"><img className="planner__image" src="img/ribbon.png" alt="save"/></button>
      </div>
    )
  }
   let styleOfBlock = {
    backgroundColor: props.backColor,
  }
  function renderEditBlock (){
    return (
      <div className="planner__task">
        <p style={styleOfBlock} className="planner__task-text">{props.taskName}</p>
        <button onClick={edit} className="planner__task-button"><img className="planner__image" src="img/pencil.png" alt="edit"/></button>
        <button onClick={remove} className="planner__task-button"><img className="planner__image" src="img/garbage.png" alt="delete"/></button>
        <Colorpalette BlockfieldIndex={props.index} colorFunction={props.colorFunction} blockfieldContext={props.context}/>
      </div>
    )
  }

  if (edited){
    return renderEditBlock();
  } else {
    return renderNormalBlock();
  }
}
class Blockfield extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      tasks: [],
      colors: [],
    }
  }
  addBlock (context, text, color) {
    var arreyOfTasks = context.state.tasks;
    var arreyOfColors = context.state.colors;
    arreyOfTasks.push(text);
    arreyOfColors.push(color);
    context.setState ({tasks: arreyOfTasks, colors: arreyOfColors})
  }
  changeColorOfBlock(context, color, index){
    var arreyOfTasks = context.state.tasks;
    var arreyOfColors = context.state.colors;
    arreyOfColors[index] = color;
    context.setState ({tasks: arreyOfTasks, colors: arreyOfColors})
  }
  deleteBlock(context, index) {
    var arreyOfTasks = context.state.tasks;
    var arreyOfColors = context.state.colors;
    arreyOfTasks.splice(index, 1);
    arreyOfColors.splice(index, 1);
    context.setState ({arreyOfTasks, colors: arreyOfColors})
  }
  updateTextInBlock(context, text, index) {
    var arreyOfTasks = context.state.tasks;
    var arreyOfColors = context.state.colors;
    arreyOfTasks[index] = text;
    context.setState ({arreyOfTasks, colors: arreyOfColors})
  }
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.target.blur()
    }
  }
  render(){
    return (
      <div className="planner__board">
        <div className="planner__title" contentEditable="" onKeyPress={this.handleKeyPress}>{this.props.titleName}</div>
        {
          this.state.tasks.map ((item,id) => {
            return (<Block backColor={this.state.colors[id]} key = {id} context={this} colorFunction={this.changeColorOfBlock} deleteFunction={this.deleteBlock} updateFunction={this.updateTextInBlock} index= {id} taskName= {item}></Block>)
          })
        }
        <button onClick={this.addBlock.bind(null, this, "Task name", "#fcfafb")} className="planner__button"><span className="planner__large-element">+</span> Add new task</button>
      </div>
    )
  }
}

let plannerContainer = document.getElementsByClassName("planner")[0];
let isDragging = false;

plannerContainer.addEventListener('mousedown', function(event) {

  let dragElement = event.target.closest('.planner__task');
  let clickElement = event.target.closest('.planner__task-text');
  if (!clickElement) return;

  event.preventDefault();

  dragElement.ondragstart = function() {
      return false;
  };

  let  shiftX, shiftY;

  startDrag(dragElement, event.clientX, event.clientY);

  function onMouseUp(event) {
    finishDrag();
  };
  let currentDroppable = null;
  function enterDroppable(elem) {
    elem.style.background = 'pink';
  }

  function leaveDroppable(elem) {
    elem.style.background = '';
  }


  function onMouseMove(event) {
    moveAt(event.clientX, event.clientY);

    dragElement.hidden = true;
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    dragElement.hidden = false;
    
    if (!elemBelow) return;
    let droppableBelow = elemBelow.closest('.planner__board');

    if (currentDroppable != droppableBelow) {

      if (currentDroppable) {
        leaveDroppable(currentDroppable);
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) {
        enterDroppable(currentDroppable);
      }
    }
  }

  function startDrag(element, clientX, clientY) {
    if(isDragging) {
      return;
    }

    isDragging = true;

    plannerContainer.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseup', onMouseUp);

    shiftX = clientX - element.getBoundingClientRect().left;
    shiftY = clientY - element.getBoundingClientRect().top;

    element.style.position = 'fixed';

    moveAt(clientX, clientY);
  };

  function finishDrag() {
    if(!isDragging) {
      return;
    }

    isDragging = false;

    dragElement.style.top = parseInt(dragElement.style.top) + window.pageYOffset + 'px';
    dragElement.style.position = 'absolute';

    plannerContainer.removeEventListener('mousemove', onMouseMove);
    dragElement.removeEventListener('mouseup', onMouseUp);
  }

  function moveAt(clientX, clientY) {
    let newX = clientX - shiftX;
    let newY = clientY - shiftY;

    if (newX > document.documentElement.clientWidth - dragElement.offsetWidth) {
      newX = document.documentElement.clientWidth - dragElement.offsetWidth;
    }

    dragElement.style.left = newX + 'px';
    dragElement.style.top = newY + 'px';
  }

});

ReactDOM.render(
  <React.StrictMode>
    <Blockfield titleName="Todo list"></Blockfield>
    <Blockfield titleName="In the process"></Blockfield>
    <Blockfield titleName="Done"></Blockfield>
  </React.StrictMode>,
  document.getElementById('planner-field')
);

serviceWorker.unregister();
