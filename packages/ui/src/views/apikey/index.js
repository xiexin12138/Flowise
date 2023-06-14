import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from 'store/actions'

// material-ui
import {
    Button,
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Popover,
    Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from 'ui-component/cards/MainCard'
import { StyledButton } from 'ui-component/button/StyledButton'
import APIKeyDialog from './APIKeyDialog'
import ConfirmDialog from 'ui-component/dialog/ConfirmDialog'

// API
import apiKeyApi from 'api/apikey'

// Hooks
import useApi from 'hooks/useApi'
import useConfirm from 'hooks/useConfirm'

// utils
import useNotifier from 'utils/useNotifier'

// Icons
import { IconTrash, IconEdit, IconCopy, IconX, IconPlus, IconEye, IconEyeOff } from '@tabler/icons'
import APIEmptySVG from 'assets/images/api_empty.svg'

// ==============================|| APIKey ||============================== //

const APIKey = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const dispatch = useDispatch()
    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [showDialog, setShowDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [apiKeys, setAPIKeys] = useState([])
    const [anchorEl, setAnchorEl] = useState(null)
    const [showApiKeys, setShowApiKeys] = useState([])
    const openPopOver = Boolean(anchorEl)

    const { confirm } = useConfirm()

    const getAllAPIKeysApi = useApi(apiKeyApi.getAllAPIKeys)

    const onShowApiKeyClick = (apikey) => {
        const index = showApiKeys.indexOf(apikey)
        if (index > -1) {
            //showApiKeys.splice(index, 1)
            const newShowApiKeys = showApiKeys.filter(function (item) {
                return item !== apikey
            })
            setShowApiKeys(newShowApiKeys)
        } else {
            setShowApiKeys((prevkeys) => [...prevkeys, apikey])
        }
    }

    const handleClosePopOver = () => {
        setAnchorEl(null)
    }

    const addNew = () => {
        const dialogProp = {
            title: '新增 API 密钥',
            type: 'ADD',
            cancelButtonName: '取消',
            confirmButtonName: '新增'
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const edit = (key) => {
        const dialogProp = {
            title: '编辑 API 密钥',
            type: 'EDIT',
            cancelButtonName: '取消',
            confirmButtonName: '保存',
            key
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const deleteKey = async (key) => {
        const confirmPayload = {
            title: `删除`,
            description: `删除秘钥 ${key.keyName}?`,
            confirmButtonName: '删除', // confirmButtonName: 'Delete',
            cancelButtonName: '取消' // cancelButtonName: 'Cancel'
        }
        const isConfirmed = await confirm(confirmPayload)

        if (isConfirmed) {
            try {
                const deleteResp = await apiKeyApi.deleteAPI(key.id)
                if (deleteResp.data) {
                    enqueueSnackbar({
                        message: 'API 秘钥已删除',
                        options: {
                            key: new Date().getTime() + Math.random(),
                            variant: 'success',
                            action: (key) => (
                                <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                    <IconX />
                                </Button>
                            )
                        }
                    })
                    onConfirm()
                }
            } catch (error) {
                const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`
                enqueueSnackbar({
                    message: `删除 API 秘钥失败: ${errorData}`,
                    // message: `Failed to delete API key: ${errorData}`,
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'error',
                        persist: true,
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                onCancel()
            }
        }
    }

    const onConfirm = () => {
        setShowDialog(false)
        getAllAPIKeysApi.request()
    }

    useEffect(() => {
        getAllAPIKeysApi.request()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getAllAPIKeysApi.data) {
            setAPIKeys(getAllAPIKeysApi.data)
        }
    }, [getAllAPIKeysApi.data])

    return (
        <>
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : '' }}>
                <Stack flexDirection='row'>
                    <h1 style={{ whiteSpace: 'nowrap' }}>API 密钥&nbsp;</h1>
                    <Box sx={{ flexGrow: 1 }} />

                    <StyledButton variant='contained' sx={{ color: 'white', mr: 1, height: 37 }} onClick={addNew} startIcon={<IconPlus />}>
                        新增密钥
                    </StyledButton>
                </Stack>
                {apiKeys.length <= 0 && (
                    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                        <Box sx={{ p: 2, height: 'auto' }}>
                            <img style={{ objectFit: 'cover', height: '30vh', width: 'auto' }} src={APIEmptySVG} alt='APIEmptySVG' />
                        </Box>
                        <div>暂无 API 秘钥</div>
                    </Stack>
                )}
                {apiKeys.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>密钥名称</TableCell>
                                    {/* <TableCell>Key Name</TableCell> */}
                                    <TableCell>API 密钥</TableCell>
                                    {/* <TableCell>API Key</TableCell> */}
                                    <TableCell>创建时间</TableCell>
                                    {/* <TableCell>Created</TableCell> */}
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {apiKeys.map((key, index) => (
                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component='th' scope='row'>
                                            {key.keyName}
                                        </TableCell>
                                        <TableCell>
                                            {showApiKeys.includes(key.apiKey)
                                                ? key.apiKey
                                                : `${key.apiKey.substring(0, 2)}${'•'.repeat(18)}${key.apiKey.substring(
                                                      key.apiKey.length - 5
                                                  )}`}
                                            <IconButton
                                                title='复制'
                                                color='success'
                                                onClick={(event) => {
                                                    navigator.clipboard.writeText(key.apiKey)
                                                    setAnchorEl(event.currentTarget)
                                                    setTimeout(() => {
                                                        handleClosePopOver()
                                                    }, 1500)
                                                }}
                                            >
                                                <IconCopy />
                                            </IconButton>
                                            <IconButton title='现实' color='inherit' onClick={() => onShowApiKeyClick(key.apiKey)}>
                                                {/* <IconButton title='Show' color='inherit' onClick={() => onShowApiKeyClick(key.apiKey)}> */}
                                                {showApiKeys.includes(key.apiKey) ? <IconEyeOff /> : <IconEye />}
                                            </IconButton>
                                            <Popover
                                                open={openPopOver}
                                                anchorEl={anchorEl}
                                                onClose={handleClosePopOver}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right'
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'left'
                                                }}
                                            >
                                                <Typography
                                                    variant='h6'
                                                    sx={{ pl: 1, pr: 1, color: 'white', background: theme.palette.success.dark }}
                                                >
                                                    已复制!
                                                </Typography>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>{key.createdAt}</TableCell>
                                        <TableCell>
                                            <IconButton title='编辑' color='primary' onClick={() => edit(key)}>
                                                <IconEdit />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton title='删除' color='error' onClick={() => deleteKey(key)}>
                                                <IconTrash />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </MainCard>
            <APIKeyDialog
                show={showDialog}
                dialogProps={dialogProps}
                onCancel={() => setShowDialog(false)}
                onConfirm={onConfirm}
            ></APIKeyDialog>
            <ConfirmDialog />
        </>
    )
}

export default APIKey
