export default function AIReplyButton({
  setReviewMode,
}: {
  setReviewMode: () => void;
}) {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={setReviewMode}
    >
      模擬問題
    </button>
  );
}
