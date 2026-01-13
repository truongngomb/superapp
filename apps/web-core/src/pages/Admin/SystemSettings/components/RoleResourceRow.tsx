import { GripVertical, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

interface RoleResourceRowProps {
  res: string;
  index: number;
  total: number;
  onRemove: (res: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function RoleResourceRow({ res, index, total, onRemove, onMoveUp, onMoveDown }: RoleResourceRowProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={res}
      dragListener={false}
      dragControls={controls}
      className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border group hover:border-primary/50 transition-colors mb-2"
    >
      <div className="flex items-center gap-3">
        <div 
          className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground touch-none"
          onPointerDown={(e) => { controls.start(e); }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs text-primary font-mono select-none">
          {res.substring(0, 2).toUpperCase()}
        </div>
        <span className="font-medium font-mono">{res}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => { onMoveUp(index); }}
          disabled={index === 0}
          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Move Up"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => { onMoveDown(index); }}
          disabled={index === total - 1}
          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
          title="Move Down"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { onRemove(res); }}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-1"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}
