export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="animate-pulse">
        <div className="h-9 w-32 rounded-md bg-slate-200" />
        <div className="mt-3 h-5 w-80 max-w-full rounded-md bg-slate-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => <div className="glass h-32 animate-pulse rounded-lg" key={index} />)}
      </div>
      <div className="glass h-[26rem] animate-pulse rounded-lg" />
    </div>
  );
}
