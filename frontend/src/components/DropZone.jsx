import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PlacedBlock from './PlacedBlock.jsx';

export default function DropZone({ placedBlocks, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'dropzone' });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[440px] border border-dashed rounded-md p-2.5 flex flex-col gap-1.5 transition-colors ${
        isOver ? 'border-green bg-[#00ff4108]' : 'border-[#1e3320]'
      }`}
    >
      {placedBlocks.length === 0 ? (
        <div className="font-mono text-[12px] text-muted2 text-center m-auto leading-loose">
          &gt;_ drop blocks here
          <br />
          in the correct order
        </div>
      ) : (
        <SortableContext
          items={placedBlocks.map((b) => `placed-${b.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {placedBlocks.map((b, i) => (
            <PlacedBlock key={b.id} block={b} index={i} onRemove={onRemove} />
          ))}
        </SortableContext>
      )}
    </div>
  );
}
