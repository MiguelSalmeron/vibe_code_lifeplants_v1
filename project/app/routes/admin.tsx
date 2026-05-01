import { FormEvent, useEffect, useState } from "react";
import { Link, Outlet } from "react-router";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";

import {
  auth,
  firebaseDebugInfo,
  getConfiguredAdminEmails,
  googleProvider,
  isFirebaseConfigured,
} from "../lib/firebase";
import styles from "./admin.module.css";

interface AdminOutletContext {
  user: User;
}

export default function AdminLayout() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAllowlistedEmail, setIsAllowlistedEmail] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isRedirectingGoogle, setIsRedirectingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setIsChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setIsChecking(false);
        return;
      }

      try {
        const tokenResult = await nextUser.getIdTokenResult(true);
        const approvedEmails = getConfiguredAdminEmails();
        const hasEmailAccess = approvedEmails.includes(String(nextUser.email || "").toLowerCase());
        const hasClaimAccess = tokenResult.claims.admin === true;
        setIsAllowlistedEmail(hasEmailAccess);
        // Firestore rules are the source of truth for admin operations.
        setIsAdmin(hasClaimAccess);
      } catch {
        setIsAllowlistedEmail(false);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth) {
      return;
    }

    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("Credenciales inválidas o acceso no habilitado.");
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      return;
    }

    setError(null);
    setIsRedirectingGoogle(true);

    try {
      await signInWithRedirect(auth, googleProvider);
    } catch {
      setIsRedirectingGoogle(false);
      setError("No se pudo iniciar sesión con Google.");
    }
  };

  const handleLogout = async () => {
    if (!auth) {
      return;
    }

    await signOut(auth);
  };

  if (!isFirebaseConfigured || !auth) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Admin no disponible</h1>
          <p>Falta configurar Firebase en el frontend. Define variables VITE_FIREBASE_* para habilitar este panel.</p>
          <Link to="/eventos" className={styles.linkButton}>
            Volver a eventos
          </Link>
        </section>
      </main>
    );
  }

  if (isChecking) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Validando sesión...</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Panel de administración</h1>
          <p>Inicia sesión con una cuenta autorizada para gestionar eventos.</p>
          <p className={styles.debugInfo}>
            Firebase: {firebaseDebugInfo.projectId} · {firebaseDebugInfo.authDomain} · key··{firebaseDebugInfo.apiKeySuffix}
          </p>
          <form className={styles.form} onSubmit={handleLogin}>
            <label>
              Correo
              <input
                type="email"
                value={email}
                onChange={(nextEvent) => setEmail(nextEvent.target.value)}
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(nextEvent) => setPassword(nextEvent.target.value)}
                required
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <button type="submit">Entrar con correo</button>
              <button type="button" className={styles.googleButton} onClick={handleGoogleLogin} disabled={isRedirectingGoogle}>
                {isRedirectingGoogle ? "Redirigiendo..." : "Entrar con Google"}
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Acceso denegado</h1>
          <p>
            {isAllowlistedEmail
              ? "Tu correo esta en VITE_ADMIN_EMAILS, pero falta el custom claim admin en tu token."
              : "Tu cuenta no tiene permisos de administrador."}
          </p>
          {isAllowlistedEmail && (
            <p>
              Para operar el panel necesitas claim admin en Firebase Auth; la allowlist del frontend no reemplaza las reglas de Firestore.
            </p>
          )}
          <div className={styles.actions}>
            <Link to="/eventos" className={styles.linkButton}>
              Ir a eventos
            </Link>
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </section>
      </main>
    );
  }

  const outletContext: AdminOutletContext = { user };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <h1>Administración</h1>
            <p>{user.email}</p>
          </div>
          <nav className={styles.nav}>
            <Link to="/admin/eventos">Eventos</Link>
            <Link to="/admin/certificados">Certificados</Link>
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </nav>
        </header>
        <Outlet context={outletContext} />
      </section>
    </main>
  );
}
