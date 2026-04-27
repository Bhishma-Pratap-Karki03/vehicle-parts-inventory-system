function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F8FB] p-6 text-[#00235C]">
      <section className="w-full max-w-lg rounded-xl border border-[#E0E6ED] bg-white p-8 shadow-[0_18px_40px_rgba(42,72,104,0.08)]">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#405470]">Page not found</p>
        <h1 className="mb-4 text-3xl font-bold">This endpoint does not exist.</h1>
        <a className="inline-flex rounded-lg bg-[#15558D] px-5 py-3 font-bold text-white hover:bg-[#0B4376]" href="/parts">
          Go to Parts Management
        </a>
      </section>
    </main>
  )
}

export default NotFoundPage
