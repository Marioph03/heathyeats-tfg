import { inject, Injectable, OnChanges, signal } from '@angular/core';       // Decoradores y utilidades de Angular.
import { HttpClient } from '@angular/common/http';                          // Cliente HTTP para comunicar con la API.
import { jwtDecode } from 'jwt-decode';                                     // Librería para decodificar tokens JWT.
import { Router } from '@angular/router';                                   // Servicio para la navegación.
import { firstValueFrom, Observable, tap } from 'rxjs';                     // Operadores RxJS para manejar flujos asíncronos.
import { User } from '../interface/User';                                   // Interfaz que representa un usuario.

@Injectable({
  providedIn: 'root', // Este servicio estará disponible en toda la aplicación.
})
export class AuthService implements OnChanges {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  private http: HttpClient = inject(HttpClient);    // Cliente HTTP inyectado.
  private router: Router = inject(Router);          // Servicio interno para navegación.

  private apiUrl = 'http://localhost:5000';         // URL base de la API.
  private isLoggedSignal = signal<boolean>(false);  // Signal para gestionar si el usuario está logueado.

  // ---------------------------------------------------------------------------
  // Métodos Públicos
  // ---------------------------------------------------------------------------

  /**
   * Getter para la señal de inicio/cierre de sesión.
   * @returns La señal de si el usuario está logueado.
   */
  get isLogged() {
    return this.isLoggedSignal.asReadonly();
  }

  /**
   * Verifica si el usuario está logueado con base en la señal.
   * Si no está logueado, redirige al login.
   * @returns `true` si está logueado, `false` si no.
   */
  isLoggedF(): boolean {
    if (this.isLogged()) {
      return true;
    } else {
      this.router.navigateByUrl('/login');
      return false;
    }
  }

  /**
   * Hook `ngOnChanges`: Detecta cambios y actualiza el estado de inicio de sesión.
   */
  ngOnChanges(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.isLoggedSignal.set(true);  // Actualiza la señal.
    } else {
      alert("No estás logueado.");
    }
  }

  /**
   * Método para iniciar sesión del usuario.
   * @param email Correo del usuario.
   * @param password_hash Contraseña del usuario (en hash).
   * @returns Observable con la respuesta que contiene el token.
   */
  logIn(email: string, password_hash: string): Observable<{ access_token: string }> {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/login`, { email, password_hash })
      .pipe(
        tap(response => {
          if (response.access_token) {
            localStorage.setItem('access_token', response.access_token); // Guarda el token en localStorage.
            this.isLoggedSignal.set(true);  // Actualiza la señal.
          }
        })
      );
  }

  /**
   * Obtiene el email del usuario desde el token almacenado.
   * @returns email del usuario o `null` si no se puede decodificar.
   */
  getEmail(): string | null {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.email || null;
      } catch (error) {
        console.error('Error al decodificar el token', error);
      }
    }
    return null;
  }

  /**
   * Obtiene el rol del usuario desde el token almacenado.
   * @returns Rol del usuario o `null` si no se puede decodificar.
   */
  async getRole(): Promise<string | null> {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken?.rol || (await this.getUserByMail(decodedToken.email)).roles || null;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Cierra la sesión del usuario y redirige al login.
   */
  logout(): void {
    localStorage.removeItem('access_token'); // Elimina el token almacenado.
    this.router.navigate(['/login']);        // Redirige al login.
  }

  /**
   * Verifica si el usuario está autenticado comprobando si hay un token almacenado.
   * @returns `true` si está autenticado, `false` en caso contrario.
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Método para crear o modificar un usuario.
   * @param id ID del usuario a modificar.
   * @param username Nombre de usuario a asignar.
   * @param password Contraseña a asignar.
   * @returns Información del usuario modificado.
   */
  async editUser(id: number, username?: string, password?: string) {
    const body = { username, password };

    const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Error al editar el usuario');
    }

    return await response.json();
  }

  /**
   * Método para eliminar un usuario.
   * @param id ID del usuario a eliminar.
   * @returns Promesa con la respuesta de la eliminación.
   */
  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`).toPromise();
  }

  // ---------------------------------------------------------------------------
  // Métodos relacionados con Usuarios
  // ---------------------------------------------------------------------------

  /**
   * Obtiene un usuario por su email.
   * @param email Email del usuario.
   * @returns Promesa con la información del usuario.
   */
  async getUserByMail(email: string): Promise<User> {
    const response = await fetch(`${this.apiUrl}/users/email/${email}`);
    if (!response.ok) throw new Error('Error al obtener el usuario.');
    return response.json();
  }

  /**
   * Obtiene un usuario por su nombre de usuario.
   * @param username Nombre de usuario.
   * @returns Promesa con la información del usuario.
   */
  async getUserByUsername(username: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/users/username/${username}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Error al obtener el usuario.');
    return response.json();
  }

  /**
   * Obtiene todos los usuarios registrados.
   * @returns Lista de usuarios existentes.
   */
  async getUsers(): Promise<User[]> {
    return await firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/usuarios`));
  }

  /**
   * Obtiene un usuario por su ID.
   * @param user_id ID del usuario.
   * @returns Promesa con la información del usuario.
   */
  async getUser(user_id: number): Promise<User> {
    const response = await fetch(`${this.apiUrl}/users/${user_id}`);
    if (!response.ok) throw new Error('Error al obtener el usuario.');
    return response.json();
  }
}
