import {
  Check,
  ChevronDown,
  ChevronsLeftRightEllipsisIcon,
} from "lucide-react";
import ShellAction from "./ShellAction";

/*
 * ToolMessage component for displaying tool execution steps
 */
export function ToolMessage() {
  return (
    <div className="bg-stone-950 rounded-lg border border-stone-800 overflow-x-hidden">
      {/* Tool Header */}
      <div className="w-full border-b h-auto flex justify-between border-stone-800">
        <p className="font-medium p-8 text-lg">Create Todo Application</p>
        <div className="h-auto w-24 flex items-center hover:bg-stone-900 justify-center border-l-2 cursor-pointer border-stone-800">
          <ChevronDown className="size-7" />
        </div>
      </div>

      {/* Tool Content */}
      <div className="p-8">
        <ul className="space-y-4">
          <li>
            <div className="flex gap-2">
              <Check className="text-teal-600 w-5 h-5" />
              <span>Create Initial Files</span>
            </div>
          </li>
          <li>
            <div className="flex gap-2">
              <Check className="text-teal-600 w-5 h-5" />
              <span>Install Dependencies</span>
            </div>
          </li>
          <li>
            <div className="flex gap-2 flex-col">
              <div className="flex gap-2">
                <ChevronsLeftRightEllipsisIcon className="text-blue-300 w-5 h-5" />
                <p>Starting Server</p>
              </div>
              <div>
                <ShellAction>php artisan serve</ShellAction>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
