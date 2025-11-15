export default function BackendLoading() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6 bg-gray-950 text-gray-200">
      <h2 className="text-2xl font-semibold mb-2">The server is starting up...</h2>
      <p className="text-gray-400 mb-4">
        The backend may take 40-60 seconds to wake up. Thank you for your patience.
      </p>

      <p className="mb-4">
        While you wait, feel free to explore my{" "}
        <a
          href="https://www.youtube.com/channel/UCzemOcCiCXHzQ6COYkV3BCA"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 font-medium underline"
        >
          YouTube channel
        </a>.
      </p>

      <p className="text-gray-500 text-sm">
        If nothing loads after a minute, try refreshing the page.
      </p>
    </div>
  );
}
