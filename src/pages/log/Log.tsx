import React, { useEffect, useMemo, useState } from 'react';
import {
  Collapse,
  Paper,
  Button,
  Stack,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Modal,
  Alert,
  TablePagination,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Visibility from '@mui/icons-material/Visibility';
import { Log, AcaoLog, EntidadeLog } from '../../types/models';
import { getAllLogs, filterLogs, LogFilter } from '../../api/methods';

interface CollapsedItemProps {
  open: boolean;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%', md: 900 },
  maxWidth: '100%',
  height: { xs: '60%', sm: '50%', md: 650 },
  maxHeight: '60%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'start' as const,
  alignItems: 'center' as const,
  backgroundColor: '#f9f9f9',
  p: 4,
  overflowY: 'auto' as const,
  scrollbarWidth: 'thin' as const,
  scrollbarColor: '#6c63ff #f1f1f1',
};

const detailsModalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%', md: 600 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
  maxHeight: '80%',
  overflowY: 'auto' as const,
};

const LogPanel: React.FC<CollapsedItemProps> = ({ open }) => {
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<LogFilter>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    severity: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpenFilterModal = () => setOpenFilterModal(true);
  const handleCloseFilterModal = () => {
    setOpenFilterModal(false);
    setFilter({}); // Reset filters on close
  };

  const handleOpenDetailsModal = (log: Log) => {
    setSelectedLog(log);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setOpenDetailsModal(false);
    setSelectedLog(null);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAllLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setAlert({ severity: 'error', message: 'Error loading logs!' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const data = await filterLogs(filter);
      setLogs(Array.isArray(data) ? data : []);
      setAlert({ severity: 'success', message: 'Filters applied successfully!' });
      setTimeout(() => setAlert(null), 3000);
      handleCloseFilterModal();
    } catch (error) {
      console.error('Error applying filters:', error);
      setAlert({ severity: 'error', message: 'Error applying filters!' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(logs.length / rowsPerPage);
    if (page >= totalPages && page > 0) {
      setPage(Math.max(totalPages - 1, 0));
    }
  }, [logs, rowsPerPage]);

  const filteredLogs = useMemo(() => {
    const validLogs = Array.isArray(logs) ? logs : [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return validLogs;
    return validLogs.filter(
      (log) =>
        (log.entidade || '').toLowerCase().includes(term) ||
        (log.funcionarios?.nomeFuncionario || '').toLowerCase().includes(term),
    );
  }, [searchTerm, logs]);

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  const entidadesDisponiveis: EntidadeLog[] = [
    'clientes',
    'estabelecimentos',
    'funcoes',
    'permissoes',
    'funcoesPermissoes',
    'funcionarios',
    'logs',
    'tarefas',
    'funcionariosTarefas',
    'categoriasProdutos',
    'produtos',
    'estoques',
    'fornecedores',
    'codigoRecuperacao',
    'entradasEstoque',
    'caixas',
    'vendas',
    'vendasProdutos',
    'seccoes',
    'corredores',
    'prateleiras',
    'localizacoes',
    'produtosLocalizacoes',
    'transferencias',
    'funcionariosCaixa',
    'alertas',
  ];

  const acoesDisponiveis: AcaoLog[] = [
    AcaoLog.CREATE,
    AcaoLog.UPDATE,
    AcaoLog.DELETE,
    AcaoLog.VIEW,
  ];

  return (
    <>
      {alert && (
        <Box sx={{ position: 'fixed', top: 20, right: 40, zIndex: 9999 }}>
          <Alert severity={alert.severity}>{alert.message}</Alert>
        </Box>
      )}

      <Paper sx={(theme) => ({ p: theme.spacing(2, 2.5), width: '100%' })}>
        <Collapse in={open}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: '100%', mb: 2 }}
          >
            <Typography variant="h5">Logs do Sistema</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Pesquisar Logs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={(theme) => ({
                  p: theme.spacing(0.625, 1.5),
                  borderRadius: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                })}
              />
              <Button
                variant="contained"
                color="secondary"
                sx={(theme) => ({ p: theme.spacing(0.625, 1.5), borderRadius: 1.5 })}
                startIcon={<IconifyIcon icon="heroicons-solid:filter" />}
                onClick={handleOpenFilterModal}
                disabled={loading}
              >
                <Typography variant="body2">Filtrar</Typography>
              </Button>
            </Stack>
          </Stack>
        </Collapse>
      </Paper>

      <Modal open={openFilterModal} onClose={handleCloseFilterModal} aria-labelledby="modal-filter-title">
        <Box sx={modalStyle} component="form" noValidate autoComplete="off">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: '100%', mb: 2 }}
          >
            <Typography variant="h5" id="modal-filter-title">
              Filtrar Logs
            </Typography>
            <Button onClick={handleCloseFilterModal} variant="outlined" color="error" disabled={loading}>
              Fechar
            </Button>
          </Stack>

          <Stack spacing={2} sx={{ width: '100%' }}>
            <FormControl variant="filled" fullWidth>
              <InputLabel>Entidade</InputLabel>
              <Select
                value={filter.entidade || ''}
                onChange={(e) => setFilter({ ...filter, entidade: e.target.value as EntidadeLog })}
                disabled={loading}
              >
                <MenuItem value="">Todas</MenuItem>
                {entidadesDisponiveis.map((entidade) => (
                  <MenuItem key={entidade} value={entidade}>
                    {entidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="filled" fullWidth>
              <InputLabel>Ação</InputLabel>
              <Select
                value={filter.acao || ''}
                onChange={(e) => setFilter({ ...filter, acao: e.target.value as AcaoLog })}
                disabled={loading}
              >
                <MenuItem value="">Todas</MenuItem>
                {acoesDisponiveis.map((acao) => (
                  <MenuItem key={acao} value={acao}>
                    {acao}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="ID do Funcionário"
              value={filter.id_funcionario || ''}
              onChange={(e) => setFilter({ ...filter, id_funcionario: e.target.value })}
              variant="filled"
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Data Inicial"
              type="datetime-local"
              value={filter.startDate || ''}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              variant="filled"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Data Final"
              type="datetime-local"
              value={filter.endDate || ''}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              variant="filled"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              fullWidth
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={applyFilters}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={20} /> : <Typography variant="body2">Aplicar Filtros</Typography>}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={openDetailsModal} onClose={handleCloseDetailsModal} aria-labelledby="modal-details-title">
        <Box sx={detailsModalStyle}>
          <Typography variant="h6" id="modal-details-title" gutterBottom>
            Detalhes do Log
          </Typography>
          {selectedLog && (
            <Stack spacing={2}>
              <Typography><strong>Entidade:</strong> {selectedLog.entidade}</Typography>
              <Typography><strong>Ação:</strong> {selectedLog.acao}</Typography>
              <Typography><strong>Funcionário:</strong> {selectedLog.funcionarios?.nomeFuncionario || 'Desconhecido'}</Typography>
              <Typography><strong>Data:</strong> {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : 'N/A'}</Typography>
              <Typography><strong>IP:</strong> {selectedLog.ip || 'N/A'}</Typography>
              {selectedLog.dadosAnteriores && (
                <Box>
                  <Typography><strong>Dados Anteriores:</strong></Typography>
                  <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    {JSON.stringify(selectedLog.dadosAnteriores, null, 2)}
                  </pre>
                </Box>
              )}
              {selectedLog.dadosNovos && (
                <Box>
                  <Typography><strong>Dados Novos:</strong></Typography>
                  <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    {JSON.stringify(selectedLog.dadosNovos, null, 2)}
                  </pre>
                </Box>
              )}
              {selectedLog.diferencas && (
                <Box>
                  <Typography><strong>Diferenças:</strong></Typography>
                  <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    {JSON.stringify(selectedLog.diferencas, null, 2)}
                  </pre>
                </Box>
              )}
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseDetailsModal}
                disabled={loading}
              >
                Fechar
              </Button>
            </Stack>
          )}
        </Box>
      </Modal>

      <Card sx={{ maxWidth: '100%', margin: 'auto', mt: 4 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Entidade</strong></TableCell>
                  <TableCell><strong>Ação</strong></TableCell>
                  <TableCell><strong>Funcionário</strong></TableCell>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>IP</strong></TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.entidade || 'Desconhecido'}</TableCell>
                      <TableCell>{log.acao || 'N/A'}</TableCell>
                      <TableCell>{log.funcionarios?.nomeFuncionario || 'Desconhecido'}</TableCell>
                      <TableCell>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>{log.ip || 'N/A'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDetailsModal(log)}
                          disabled={loading}
                          aria-label="visualizar"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum log encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />
        </CardContent>
      </Card>
    </>
  );
};

export default LogPanel;
