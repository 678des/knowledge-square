export default function AIReplyButton({
  setReviewMode,
}: {
  setReviewMode: () => void;
}) {
  return (
    <button
      className="w-full rounded-md bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 focus:outline-none shrink-0"
      onClick={setReviewMode}
    >
      これまでの会話から問題を作成する
    </button>
  );
}
