import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';
import { Suspense, lazy } from 'react';
import Progress from 'components/loading/Progress';
import LinearLoader from 'components/loading/LinearLoader';
import Stock from 'pages/stock/Stock';
import Funcionario from 'pages/funcionario/Funcionario';
import Fornecedor from 'pages/fornecedor/Fornecedor';
import Cliente from 'pages/cliente/Cliente';
import Faturacao from 'pages/faturacao/Faturacao';
import Relatorio from 'pages/relatorio/Relatorio';
import Loja from 'pages/produt';
import Corredor from 'pages/corredor/Corredor';
import Estabelecimento from 'pages/estabelecimento/Estabelecimento';
import Prateleira from 'pages/prateleira/Prateleira';
import LocalProduto from 'pages/produt/ProdutoLocalizacao';
import Tarefa from 'pages/tarefa/tarefa';
import Secao from 'pages/seccao/Seccao';
import Caixas from 'pages/caixa/caixa';
import Perfil from 'pages/perfil/Perfil';
import { StockProvider } from 'pages/stock/StockContext';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtecteRoute';

const App = lazy(() => import('App'));
const MainLayout = lazy(() => import('layouts/main-layout'));
const Categoria = lazy(() => import('pages/categoria/Categoria'));
const AuthLayout = lazy(() => import('layouts/auth-layout'));
const Dashboard = lazy(() => import('pages/dashboard/Dashboard'));
const Armazem = lazy(() => import('pages/localizacao/Localizacao'));
const Login = lazy(() => import('pages/authentication/Login'));
const Signup = lazy(() => import('pages/authentication/Signup'));
const ErrorPage = lazy(() => import('pages/errors/ErrorPage'));
const LogPanel = lazy(() => import('pages/log/Log')); // Importação confirmada

export const routes = [
  {
    element: (
      <Suspense fallback={<Progress />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: rootPaths.authRoot,
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Login />,
          },
          {
            path: paths.signup,
            element: <Signup />,
          },
        ],
      },
      {
        element: <ProtectedRoute />, // Proteção geral para autenticação
        children: [
          {
            path: rootPaths.pagesRoot,
            element: (
              <MainLayout>
                <StockProvider>
                  <Suspense fallback={<LinearLoader />}>
                    <Outlet />
                  </Suspense>
                </StockProvider>
              </MainLayout>
            ),
            children: [
              {
                path: paths.caixa,
                element: <Caixas open={true} />,
              },
              {
                path: paths.categorias,
                element: <Categoria open={true} />,
              },
              {
                path: paths.cliente,
                element: <Cliente open={true} />,
              },
              {
                path: paths.corredor,
                element: <Corredor open={true} />,
              },
              {
                path: paths.dashboard,
                element: (
                  <ProtectedRoute requiredRoles={['Admin', 'Gerente']} redirectTo={paths.perfil}>
                    <Dashboard />
                  </ProtectedRoute>
                ),
              },
              {
                path: paths.estabelecimento,
                element: (
                  <ProtectedRoute requiredRoles={['Admin']} redirectTo={paths.perfil}>
                    <Estabelecimento open={true} />
                  </ProtectedRoute>
                ),
              },
              {
                path: paths.faturacao,
                element: <Faturacao />,
              },
              {
                path: paths.funcionarios,
                element: <Funcionario open={true} />,
              },
              {
                path: paths.localizacao,
                element: <Armazem open={true} />,
              },
              {
                path: paths.localProduto,
                element: <LocalProduto open={true} />,
              },
              {
                path: paths.logs,
                element: (
                  <ProtectedRoute requiredRoles={['Admin', 'Gerente']} redirectTo={paths.perfil}>
                    <LogPanel open={true} />
                  </ProtectedRoute>
                ),
              },
              {
                path: paths.perfil,
                element: <Perfil />,
              },
              {
                path: paths.prateleira,
                element: <Prateleira open={true} />,
              },
              {
                path: paths.relatorio,
                element: <Relatorio />,
              },
              {
                path: paths.seccao,
                element: <Secao open={true} />,
              },
              {
                path: paths.estoque,
                element: <Stock />,
              },
              {
                path: paths.tarefa,
                element: <Tarefa />,
              },
              {
                path: paths.vendas,
                element: <Fornecedor open={true} />,
              },
              {
                path: paths.loja,
                element: <Loja open={true} />,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <ErrorPage />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, { basename: '/' });

export default router;