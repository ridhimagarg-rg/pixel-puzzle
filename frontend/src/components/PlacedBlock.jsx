import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function PlacedBlock({ block, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `placed-${block.id}`,
    data: { block, from: 'placed' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-stretch">
      <div className="font-mono text-[11px] text-muted2 min-w-[20px] text-right pt-[9px] select-none">
        {index + 1}
      </div>
      <div
        {...listeners}
        {...attributes}
        onDoubleClick={() => onRemove(block)}
        className={`flex-1 bg-bg3 border border-[#1e2d20] rounded-[3px] px-[11px] py-[9px] font-mono text-[12px] text-[#a8d5a2] cursor-grab select-none whitespace-pre leading-relaxed hover:border-green ${
          isDragging ? 'opacity-30 cursor-grabbing' : ''
        }`}
        title="Drag to reorder, double-click to send back"
      >
        {block.code}
      </div>
    </div>
  );
}
