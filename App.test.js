import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import App from './App';

jest.mock('./database', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

describe('App', () => {
  test('renders login screen when not authenticated', () => {
    render(<App />);

    // Testando a renderização da tela de login
    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByPlaceholderText('Usuário')).toBeTruthy();
    expect(screen.getByPlaceholderText('Senha')).toBeTruthy();
    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  test('renders registration screen when switching to register', () => {
    render(<App />);

    // Clicando para ir para a tela de cadastro
    fireEvent.press(screen.getByText('Ainda não tem uma conta? Cadastrar'));

    // Testando se a tela de cadastro foi renderizada
    expect(screen.getByText('Cadastro')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nome')).toBeTruthy();
  });


test('block unavailable time slots', async () => {
    render(<App />);

    fireEvent.changeText(screen.getByPlaceholderText('Usuário'), 'testuser');
    fireEvent.changeText(screen.getByPlaceholderText('Senha'), 'password');
    fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => {
      const blockedTimes = screen.queryAllByText('Escolha o horário').length;
      expect(blockedTimes).toBeGreaterThan(0);
    });
  });
});