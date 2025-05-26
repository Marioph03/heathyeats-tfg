import {inject, Injectable, OnChanges, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import {Router} from '@angular/router';
import {firstValueFrom, Observable, tap} from 'rxjs';
import {User} from '../interface/User';

@Injectable({
  providedIn: 'root',
})

export class AuthService implements OnChanges{
  private  http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  //Url de la API
  private apiUrl = 'http://localhost:5000';
  //Signal de inicio/cierre de sesion
  private isLoggedSignal = signal<boolean>(false);

  //Getter de la signal de login
  get isLogged() {
    return this.isLoggedSignal.asReadonly();
  }

  //Funcion para obtener el valor de la signal
  isLoggedF(): boolean {
    if (this.isLogged()) {
      return true;
    } else {
      this.router.navigateByUrl('/login')
      return false;
    }
  }

  ngOnChanges(): void {
    const token: string | null = localStorage.getItem('access_token');

    if (token) {
      this.isLoggedSignal.set(true);
    } else {
      alert("Nope")
    }
  }

  /**
   * Método de iniciar sesión, es llamado cuando el formulario es válido
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * Necesita subscripción en el componente en el que se usará
   */

  logIn(email: string, password_hash: string): Observable<{ access_token: string }> {
    return this.http
      .post<{ access_token: string }>(
        `${this.apiUrl}/login`,
        { email, password_hash }
      )
      .pipe(
        tap(response => {
          const token = response.access_token;
          if (token) {
            localStorage.setItem('access_token', token);
            this.isLoggedSignal.set(true);
          }
        })
      );
  }

  /**
   * Método para obtener el nombre de usuario desde el token
   * @returns El email del usuario
   */
  getEmail(): string | null {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        // Decodificar el token JWT
        const decoded: any = jwtDecode(token);

        // Retornar el nombre de usuario desde el payload del token
        return decoded.email || null;
      } catch (error) {
        console.error('Error al decodificar el token', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Método para obtener a un usuario dado su email
   * @param email Correo electrónico del usuario
   * @returns Promise<Usuario> El usuario registrado con ese correo
   */
  async getUserByMail(email: string): Promise<User> {
    const response = await fetch(`${this.apiUrl}/users/email/${email}`)

    if (!response.ok) {
      throw new Error('Error al obtener el usuario');
    }

    const json = await response.json();

    return await json;
  }

  /**
   * Método para obtener un usuario dado su nombre de usuario
   * @param username El nombre de usuario del usuario
   * @returns El usuario al que pertenece ese username
   */
  async getUserByUsername(username: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/users/username/${username}`);
    if (response.status === 404) {
      return true;
    }

    if (!response.ok) {
      throw new Error('Error al obtener el usuario');
    }

    const json = await response.json();
    return json;
  }

  /**
   * Método para obtener a todos los usuarios existentes
   * @returns Lista de usuarios existentes
   */
  async getUsers(): Promise<User[]> {
    try {
      return await firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/usuarios`));
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      return [];
    }
  }

  /**
   * Método para obtener a un usuario dado su id
   * @param user_id del usuario
   * @returns El usuario al que pertenece ese id
   */
  async getUser(user_id: number) {
    const response = await fetch(`${this.apiUrl}/users/${user_id}`)

    if (!response.ok) {
      throw new Error('Error al obtener el usuario');
    }

    return response.json();
  }

  /**
   * Método para obtener el rol del usuario logueado mediante su token almacenado localmente
   * @returns El rol del usuario
   */
  async getRole() {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        // Decodificar el token
        const decodedToken: any = jwtDecode(token);
        console.log('Decoded Token:', decodedToken);

        // Verifica que el rol esté presente en el token
        return decodedToken?.rol || (await this.getUserByMail(decodedToken.email)).roles;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Método para iniciar sesión con google
   * @param response
   * @returns El email obtenido al decodificar el token de google
   */
  async loginWithGoogle(response: string) {
    const decodedToken = this.decodeJwtResponse(response);
    console.log("Decoded token", decodedToken);
    const fetchResponse = await fetch(`${this.apiUrl}/api/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: decodedToken.email })
    });

    return fetchResponse.json();
  }

  /**
   * Método para crear un usuario
   * @param id Clave del usuario a editar
   * @param username Nuevo nombre de usuario (opcional)
   * @param password Nueva contraseña (opcional)
   * @returns El usuario editado
   */
  async editUser(id: number, username?: string, password?: string) {
    try {
      const body = { username, password };

      const response = await fetch(`${this.apiUrl}/usuarios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Suponiendo que el backend responde con un mensaje de error si el username ya existe
        if (errorData.message === 'Username already exists') {
          throw new Error('username already exists');
        }

        throw new Error('Error al editar el usuario');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param id Clave del usuario a eliminar
   * @returns Mensaje de éxito al borrar o borrado fallido
   */
  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`).toPromise();
  }

  /**
   * Método para cerrar sesión y redirigir al login
   */
  logout(): void {
    localStorage.removeItem('access_token');

    this.router.navigate(['/login']);
  }

  /**
   *
   * @param token El token JWT
   * @returns el payload del token decodificado
   */
  decodeJwtResponse(token: string) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  /**
   * Método para decodificar el token JWT
   * @param token El token de inicio de sesión
   * @returns El token de inicio de sesión decodificado
   */
  decodeToken(token: string): any {
    return jwtDecode(token);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  getUserRole(): string {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return '';
    }
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.rol || '';
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return '';
    }
  }

  isLoggedIn() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }
}
