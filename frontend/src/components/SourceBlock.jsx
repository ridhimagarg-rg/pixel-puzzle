import { useDraggable } from '@dnd-kit/core';

export default function SourceBlock({ block, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `source-${block.id}`,
    data: { block, from: 'source' },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick?.(block)}
      className={`bg-bg3 border border-[#1e2d20] rounded-[3px] px-[11px] py-[9px] font-mono text-[12px] text-[#a8d5a2] cursor-grab select-none whitespace-pre leading-relaxed transition-shadow hover:border-green hover:shadow-[0_0_8px_var(--tw-shadow-color)] hover:shadow-green-dim ${
        isDragging ? 'opacity-30 cursor-grabbing' : ''
      }`}
      title="Drag into YOUR_CODE, or click to add"
    >
      {block.code}
    </div>
  );
}
