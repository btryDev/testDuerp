export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col items-center justify-center px-6 py-16 text-center sm:px-12">
      <p className="font-mono text-[0.72rem] tracking-[0.2em] uppercase text-muted-foreground">
        DUERP
      </p>
      <h1 className="mt-8 font-serif text-4xl leading-tight sm:text-5xl">
        Statut : en développement
      </h1>
      <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted-foreground">
        La plateforme est en cours de construction. Revenez prochainement.
      </p>
    </main>
  );
}
