// Câu đối hai bên kiểu "liễn đối cuộn" cho trang Dashboard.
// Vế 1 (thượng liên) treo bên phải, vế 2 (hạ liên) bên trái — đọc phải sang trái.
// Chỉ hiển thị trên màn hình rất rộng (>=1600px) để không đè lên nội dung.

const RIGHT_LINE = "Cháu con muôn thuở rạng gia phong";
const LEFT_LINE = "Đặng tộc nghìn thu lưu phúc ấm";

// Ưu tiên font thư pháp (biến --font-thuphap, sẽ nối qua next/font/local khi có
// file font), tạm fallback về Playfair rồi cursive.
const coupletFontStyle = {
  fontFamily: "var(--font-thuphap), var(--font-playfair), cursive",
};

function Scroll({ text, side }: { text: string; side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-1/2 z-20 hidden -translate-y-1/2 min-[1700px]:block ${
        side === "left" ? "left-16" : "right-16"
      }`}
    >
      <div
        className={`flex flex-col items-center ${
          side === "left" ? "couplet-anim-alt" : "couplet-anim"
        }`}
      >
        {/* Trục cuộn trên */}
        <div className="h-3.5 w-[118%] rounded-full bg-gradient-to-b from-red-500 via-red-700 to-red-900 shadow-md ring-1 ring-amber-300/40" />

        {/* Thân liễn */}
        <div className="-my-1 rounded-md border-2 border-red-700 bg-[linear-gradient(180deg,#faf1d8_0%,#f1e0b8_100%)] px-3 py-5 shadow-lg">
          <div className="rounded-[3px] border border-amber-500/50 px-2.5 py-4">
            <div
              className="flex flex-col items-center gap-3 text-6xl leading-none text-[#5a2216]"
              style={coupletFontStyle}
            >
              {text.split(" ").map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Trục cuộn dưới */}
        <div className="h-3.5 w-[118%] rounded-full bg-gradient-to-b from-red-600 via-red-800 to-red-950 shadow-md ring-1 ring-amber-300/40" />
        {/* Tua rua đỏ buông xuống */}
        <div className="h-5 w-1 rounded-b-full bg-gradient-to-b from-red-700 to-transparent" />
      </div>
    </div>
  );
}

export default function AncestralCouplets() {
  return (
    <>
      <Scroll text={RIGHT_LINE} side="right" />
      <Scroll text={LEFT_LINE} side="left" />
    </>
  );
}
