import { HttpStatusCode } from 'axios';
import type { Response } from 'express';
import type { ResponseExtended } from '../middlewares/validare-response.js';
import type {
  ErrorResponseSchema,
  PaginationSchema,
  SuccessPaginatedResponseSchema,
  SuccessResponseNoDataSchema,
  SuccessResponseSchema,
} from '../modules/common/common-schemas.js';

export enum ErrorCode {
  // --- Errori di Input e Validazione ---
  /**
   * Errore generico di validazione.
   * I dettagli specifici dovrebbero essere nel campo 'details' della risposta di errore.
   */
  ValidationFailed = 'ValidationFailed',
  /**
   * Uno o più campi obbligatori non sono stati forniti.
   */
  RequiredFieldMissing = 'RequiredFieldMissing',
  /**
   * Il formato di un campo non è valido (es. email, URL, data, numero).
   */
  InvalidFormat = 'InvalidFormat',
  /**
   * Un valore fornito è fuori dall'intervallo consentito (es. numero troppo grande/piccolo, stringa troppo lunga/corta).
   */
  ValueOutOfRange = 'ValueOutOfRange',
  /**
   * Input generico non valido, quando le altre categorie non si applicano perfettamente.
   */
  InvalidInput = 'InvalidInput',

  // --- Errori di Autenticazione e Autorizzazione ---
  /**
   * Credenziali fornite (es. username/password) non valide.
   */
  InvalidCredentials = 'InvalidCredentials',
  /**
   * Token di autenticazione mancante, non valido o malformato.
   */
  AuthenticationTokenError = 'AuthenticationTokenError',
  /**
   * Token di autenticazione scaduto.
   */
  TokenExpired = 'TokenExpired',
  /**
   * L'utente è autenticato ma non ha i permessi necessari per accedere alla risorsa o eseguire l'azione.
   */
  TokenNotFound = 'TokenNotFound',
  AccessDenied = 'AccessDenied', // Equivalente a Forbidden,
  TokenBlacklisted = 'TokenBlacklisted',
  /**
   * L'account utente è bloccato.
   */
  AccountLocked = 'AccountLocked',
  /**
   * L'account utente è sospeso.
   */
  AccountSuspended = 'AccountSuspended',
  /**
   * L'account utente non è stato ancora verificato (es. tramite email).
   */
  AccountNotVerified = 'AccountNotVerified',

  // --- Errori relativi alle Risorse ---
  /**
   * La risorsa richiesta non è stata trovata (generico).
   */
  NotFound = 'NotFound',
  /**
   * Una risorsa specifica di tipo Utente non è stata trovata.
   */
  UserNotFound = 'UserNotFound',
  /**
   * Una risorsa specifica di tipo Prodotto non è stata trovata.
   */
  ProductNotFound = 'ProductNotFound', // Esempio di risorsa specifica
  /**
   * Si è tentato di creare una risorsa che esiste già (es. email duplicata durante la registrazione).
   */
  ResourceAlreadyExists = 'ResourceAlreadyExists',
  /**
   * La richiesta è in conflitto con lo stato attuale della risorsa (es. modifica di un ordine già spedito).
   * Più generico di ResourceAlreadyExists.
   */
  Conflict = 'Conflict',
  /**
   * Errore di concorrenza, ad esempio fallimento del blocco ottimistico (versione della risorsa cambiata).
   */
  VersionConflict = 'VersionConflict',

  // --- Errori di Logica di Business o di Processo ---
  /**
   * Un'operazione di business non è consentita secondo le regole definite.
   */
  OperationNotAllowed = 'OperationNotAllowed',
  /**
   * Scorte insufficienti per un prodotto.
   */
  InsufficientStock = 'InsufficientStock',
  /**
   * Fondi insufficienti per completare una transazione.
   */
  InsufficientFunds = 'InsufficientFunds',
  /**
   * È stata superata una quota o un limite (es. numero massimo di richieste).
   */
  QuotaExceeded = 'QuotaExceeded',
  /**
   * L'operazione richiesta è scaduta lato server.
   */
  RequestTimeout = 'RequestTimeout', // Diverso da un timeout di rete

  // --- Errori relativi a Servizi Esterni / Dipendenze ---
  /**
   * Un servizio esterno o una dipendenza non è disponibile.
   */
  ServiceUnavailable = 'ServiceUnavailable',
  /**
   * Errore restituito da un servizio esterno.
   */
  ExternalServiceError = 'ExternalServiceError',
  /**
   * Timeout durante la comunicazione con un servizio esterno.
   */
  DependencyTimeout = 'DependencyTimeout',

  // --- Errori Generici del Server ---
  /**
   * Errore generico e imprevisto del server. Usare con parsimonia, preferendo codici più specifici.
   */
  InternalError = 'InternalError',
  /**
   * Il server non è configurato correttamente per gestire la richiesta.
   */
  ConfigurationError = 'ConfigurationError',
  /**
   * Il server è sovraccarico o in manutenzione e non può gestire la richiesta.
   * Spesso associato a un HTTP 503.
   */
  ServerBusy = 'ServerBusy',
}

export class ResponseHandler {
  #response: Response | ResponseExtended;

  private constructor(response: Response | ResponseExtended) {
    this.#response = response;
  }

  static from(response: Response) {
    return new ResponseHandler(response);
  }

  noData(message: string = 'OK') {
    const payload: SuccessResponseNoDataSchema = {
      message,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Ok).json(payload);
  }

  ok<T>(data: T, message: string = 'OK') {
    const payload: SuccessResponseSchema<T> = {
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return 'jsonValidate' in this.#response
      ? this.#response.status(HttpStatusCode.Ok).jsonValidate(payload)
      : this.#response.status(HttpStatusCode.Ok).json(payload);
  }

  paginated<T>(
    data: T[],
    pagination: Omit<PaginationSchema, 'totalPages'>,
    message: string = 'OK'
  ) {
    const { page, limit, totalItems } = pagination;

    const totalPages = Math.ceil(totalItems / limit);

    const payload: SuccessPaginatedResponseSchema<T> = {
      message,
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Ok).json(payload);
  }

  created<T>(data: T, message: string = 'Created') {
    const payload: SuccessResponseSchema<T> = {
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Created).json(payload);
  }

  unauthorized(
    code: ErrorCode,
    message: string = 'Unauthorized',
    details?: unknown
  ) {
    const payload: ErrorResponseSchema = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Unauthorized).json(payload);
  }

  forbidden(code: ErrorCode, message: string = 'Forbidden', details?: unknown) {
    const payload: ErrorResponseSchema = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Forbidden).json(payload);
  }

  notFound(code: ErrorCode, message: string = 'Not found', details?: unknown) {
    const payload: ErrorResponseSchema = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.NotFound).json(payload);
  }

  badRequest(
    code: ErrorCode,
    message: string = 'Bad request',
    details?: unknown
  ) {
    const payload: ErrorResponseSchema = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.BadRequest).json(payload);
  }

  conflict(code: ErrorCode, message: string = 'Conflict', details?: unknown) {
    const payload: ErrorResponseSchema = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(HttpStatusCode.Conflict).json(payload);
  }

  customError(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: unknown
  ) {
    const payload: ErrorResponseSchema = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(statusCode).json(payload);
  }
}
