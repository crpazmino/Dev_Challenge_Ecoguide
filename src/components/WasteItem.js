import React from 'react';

const WasteItem = ({ item, onDragStart }) => {
  const handleDrag = (e) => {
    // Es vital pasar item.tipo (ej: 'yellow') al dataTransfer
    e.dataTransfer.setData("itemType", item.tipo); 
    onDragStart(e, item);
  };

  return (
    <div 
      className="waste-item"
      draggable
      onDragStart={handleDrag}
    >
      <span style={{ fontSize: '4rem' }}>{item.icono}</span>
      <p>{item.nombre}</p>
    </div>
  );
};

export default WasteItem;