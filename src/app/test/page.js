export default function TestPage() {
  return (
    <div>
      <div style={{backgroundColor: 'red', color: 'white', padding: '20px'}}>
        Inline styles test - should be RED
      </div>
      <div className="bg-blue-500 text-white p-5">
        Tailwind test - should be BLUE
      </div>
    </div>
  );
}