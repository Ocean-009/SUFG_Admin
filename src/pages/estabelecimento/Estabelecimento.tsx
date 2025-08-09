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
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Edit from 'components/icons/factor/Edit';
import Delete from 'components/icons/factor/Delete';
import { Estabelecimento as EstabelecimentoModel } from '../../types/models';
import {
  getAllEstablishments,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
} from '../../api/methods';

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

const confirmModalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
};

const EstabelecimentoPanel: React.FC<CollapsedItemProps> = ({ open }) => {
  const [openEstabelecimento, setOpenEstabelecimento] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [estabelecimentoToDelete, setEstabelecimentoToDelete] = useState<string | null>(null);
  const [editEstabelecimentoId, setEditEstabelecimentoId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const [estabelecimentos, setEstabelecimentos] = useState<EstabelecimentoModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<{ nome?: string; endereco?: string; telefone?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    severity: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = () => setOpenEstabelecimento(true);
  const handleClose = () => {
    setOpenEstabelecimento(false);
    setEditEstabelecimentoId(null);
    setNome('');
    setEndereco('');
    setTelefone('');
    setEmail('');
    setErrors({});
  };

  const handleOpenConfirmModal = (id: string) => {
    setEstabelecimentoToDelete(id);
    setOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
    setEstabelecimentoToDelete(null);
  };

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const data = await getAllEstablishments();
      setEstabelecimentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      setAlert({ severity: 'error', message: 'Erro ao carregar estabelecimentos!' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  useEffect(() => {
    // if current page is out of range after data change, reset to last page
    const totalPages = Math.ceil(estabelecimentos.length / rowsPerPage);
    if (page >= totalPages && page > 0) {
      setPage(Math.max(totalPages - 1, 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estabelecimentos, rowsPerPage]);

  const filteredEstabelecimentos = useMemo(() => {
    const validEstabelecimentos = Array.isArray(estabelecimentos) ? estabelecimentos : [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return validEstabelecimentos;
    return validEstabelecimentos.filter((estabelecimento) =>
      (estabelecimento.nome || '').toLowerCase().includes(term),
    );
  }, [searchTerm, estabelecimentos]);

  const paginatedEstabelecimentos = useMemo(() => {
    return filteredEstabelecimentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredEstabelecimentos, page, rowsPerPage]);

  const validateForm = () => {
    const newErrors: { nome?: string; endereco?: string; telefone?: string; email?: string } = {};
    if (!nome || !nome.trim()) newErrors.nome = 'O nome é obrigatório';
    if (!endereco || !endereco.trim()) newErrors.endereco = 'O endereço é obrigatório';
    if (!telefone || !telefone.trim()) newErrors.telefone = 'O telefone é obrigatório';
    if (!email || !email.trim()) newErrors.email = 'O email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEstabelecimento = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const estabelecimentoData = { nome: nome.trim(), endereco: endereco.trim(), telefone: telefone.trim(), email: email.trim() };

      if (editEstabelecimentoId) {
        // update
        await updateEstablishment(editEstabelecimentoId, estabelecimentoData);
        setAlert({ severity: 'success', message: 'Estabelecimento atualizado com sucesso!' });
      } else {
        await createEstablishment(estabelecimentoData);
        setAlert({ severity: 'success', message: 'Estabelecimento cadastrado com sucesso!' });
      }

      // refresh list
      await fetchEstablishments();
      handleClose();

      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error);
      setAlert({ severity: 'error', message: 'Erro ao salvar estabelecimento!' });
      setErrors({ nome: 'Erro ao salvar. Tente novamente.' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const estabelecimentoToEdit = estabelecimentos.find((est) => est.id === id);
    if (estabelecimentoToEdit) {
      setNome(estabelecimentoToEdit.nome || '');
      setEndereco(estabelecimentoToEdit.endereco || '');
      setTelefone(estabelecimentoToEdit.telefone || '');
      setEmail(estabelecimentoToEdit.email || '');
      setEditEstabelecimentoId(id);
      handleOpen();
    } else {
      setAlert({ severity: 'error', message: 'Estabelecimento não encontrado para edição.' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!estabelecimentoToDelete) return;

    try {
      setLoading(true);
      await deleteEstablishment(estabelecimentoToDelete);
      await fetchEstablishments();
      setAlert({ severity: 'success', message: 'Estabelecimento excluído com sucesso!' });
      setTimeout(() => setAlert(null), 3000);

      const totalFiltered = filteredEstabelecimentos.length - 1; // after deletion
      const totalPages = Math.ceil(Math.max(totalFiltered, 0) / rowsPerPage);
      if (page >= totalPages && page > 0) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error('Erro ao excluir estabelecimento:', error);
      setAlert({ severity: 'error', message: 'Erro ao excluir estabelecimento!' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
      handleCloseConfirmModal();
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

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
            <Typography variant="h5">Cadastrar Estabelecimento</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Pesquisar Estabelecimento"
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
                startIcon={<IconifyIcon icon="heroicons-solid:plus" />}
                onClick={handleOpen}
                disabled={loading}
              >
                <Typography variant="body2">Adicionar</Typography>
              </Button>
            </Stack>
          </Stack>
        </Collapse>
      </Paper>

      <Modal open={openEstabelecimento} onClose={handleClose} aria-labelledby="modal-estabelecimento-title">
        <Box sx={modalStyle} component="form" noValidate autoComplete="off">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: '100%', mb: 2 }}
          >
            <Typography variant="h5" id="modal-estabelecimento-title">
              {editEstabelecimentoId ? 'Editar Estabelecimento' : 'Cadastrar Estabelecimento'}
            </Typography>
            <Button onClick={handleClose} variant="outlined" color="error" disabled={loading}>
              Fechar
            </Button>
          </Stack>

          <Stack spacing={2} sx={{ width: '100%' }}>
            <TextField
              label="Nome do Estabelecimento"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              variant="filled"
              error={Boolean(errors.nome)}
              helperText={errors.nome}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              variant="filled"
              error={Boolean(errors.endereco)}
              helperText={errors.endereco}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              variant="filled"
              error={Boolean(errors.telefone)}
              helperText={errors.telefone}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="filled"
              error={Boolean(errors.email)}
              helperText={errors.email}
              disabled={loading}
              fullWidth
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddEstabelecimento}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={20} /> : <Typography variant="body2">{editEstabelecimentoId ? 'Atualizar' : 'Cadastrar'}</Typography>}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={openConfirmModal} onClose={handleCloseConfirmModal} aria-labelledby="confirm-delete-title">
        <Box sx={confirmModalStyle}>
          <Typography variant="h6" id="confirm-delete-title" gutterBottom>
            Confirmar Exclusão
          </Typography>
          <Typography variant="body1" mb={3}>
            Tem certeza que deseja excluir este estabelecimento? Esta ação não pode ser desfeita.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseConfirmModal}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Card sx={{ maxWidth: '100%', margin: 'auto', mt: 4 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Nome do Estabelecimento</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Endereço</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Telefone</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Ações</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : paginatedEstabelecimentos.length > 0 ? (
                  paginatedEstabelecimentos.map((estabelecimento) => (
                    <TableRow key={estabelecimento.id}>
                      <TableCell>{estabelecimento.nome || 'Sem nome'}</TableCell>
                      <TableCell>{estabelecimento.endereco || 'Sem endereço'}</TableCell>
                      <TableCell>{estabelecimento.telefone || 'Sem telefone'}</TableCell>
                      <TableCell>{estabelecimento.email || 'Sem email'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(estabelecimento.id!)}
                          disabled={loading}
                          aria-label="editar"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenConfirmModal(estabelecimento.id!)}
                          disabled={loading}
                          aria-label="excluir"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum estabelecimento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredEstabelecimentos.length}
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

export default EstabelecimentoPanel;
