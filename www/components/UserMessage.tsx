/*
 * UserMessage component for displaying user messages
 * @param initials - User's initials for avatar
 * @param msg - Message content
 */
export function UserMessage({
  initials,
  msg,
}: {
  initials: string;
  msg: string;
}) {
  return (
    <div className="bg-[#0d0d0d] rounded-lg p-4 border border-stone-800">
      <div className="flex items-center p-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-purple-500 flex items-center justify-center mr-3">
          <span className="text-white font-bold">{initials}</span>
        </div>
        <p className="text-gray-300 font-medium leading-7">{msg}</p>
      </div>
    </div>
  );
}
