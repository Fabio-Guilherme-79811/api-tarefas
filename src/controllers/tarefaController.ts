// src/controllers/tarefaController.ts
import { Request, Response } from "express";
import * as TarefaModel from "../models/tarefaModel";
import { ApiResponse, Tarefa, FiltroQuery, AtualizarTarefaBody, TarefaParams } from "../interfaces";

export async function listar(req: Request<{},{},{},FiltroQuery>, res: Response) {
  try {
    let tarefas = await TarefaModel.listarTodas();
    if (req.query.concluida === "true") tarefas = tarefas.filter(t => t.concluida);
    if (req.query.concluida === "false") tarefas = tarefas.filter(t => !t.concluida);
    if (req.query.prioridade) tarefas = tarefas.filter(t => t.prioridade === req.query.prioridade);
    res.json({ sucesso: true, dados: tarefas } as ApiResponse<Tarefa[]>);
  } catch { res.status(500).json({ sucesso: false, erro: 'Erro interno' }); }
}

export async function criar(req: Request, res: Response) {
  try {
    const { titulo, descricao, prioridade } = req.body;
    const erros: string[] = [];
    if (!titulo || typeof titulo !== "string") erros.push("titulo é obrigatório");
    if (!["alta","media","baixa"].includes(prioridade)) erros.push("prioridade inválida");
    if (erros.length > 0) { res.status(400).json({ sucesso:false, erros }); return; }
    const nova = await TarefaModel.criar({ titulo, descricao, prioridade });
    res.status(201).json({ sucesso: true, dados: nova });
  } catch { res.status(500).json({ sucesso: false, erro: 'Erro interno' }); }
}

export async function buscarPorId(req: Request<TarefaParams>, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ sucesso: false, erro: "ID inválido" } as ApiResponse<null>);
      return;
    }
    const tarefa = await TarefaModel.buscarPorId(id);
    if (!tarefa) {
      res.status(404).json({ sucesso: false, erro: "Tarefa não encontrada" } as ApiResponse<null>);
      return;
    }
    res.json({ sucesso: true, dados: tarefa } as ApiResponse<Tarefa>);
  } catch {
    res.status(500).json({ sucesso: false, erro: "Erro interno" });
  }
}

export async function atualizar(req: Request<TarefaParams, {}, AtualizarTarefaBody>, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ sucesso: false, erro: "ID inválido" } as ApiResponse<null>);
      return;
    }

    const { titulo, descricao, prioridade, concluida } = req.body;
    const erros: string[] = [];

    if (titulo !== undefined && typeof titulo !== "string") erros.push("titulo deve ser string");
    if (prioridade !== undefined && !["alta", "media", "baixa"].includes(prioridade)) erros.push("prioridade inválida");
    if (concluida !== undefined && typeof concluida !== "boolean") erros.push("concluida deve ser boolean");

    if (erros.length > 0) {
      res.status(400).json({ sucesso: false, erros } as ApiResponse<null>);
      return;
    }
    
    const dadosAtualizacao: Partial<Tarefa> = {};
    
    if (titulo !== undefined) dadosAtualizacao.titulo = titulo;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (prioridade !== undefined) dadosAtualizacao.prioridade = prioridade;
    if (concluida !== undefined) dadosAtualizacao.concluida = concluida;

    const atualizada = await TarefaModel.atualizar(id, dadosAtualizacao);

    if (!atualizada) {
      res.status(404).json({ sucesso: false, erro: "Tarefa não encontrada" } as ApiResponse<null>);
      return;
    }

    res.json({ sucesso: true, dados: atualizada } as ApiResponse<Tarefa>);
  } catch {
    res.status(500).json({ sucesso: false, erro: "Erro interno" });
  }
}

export async function remover(req: Request<TarefaParams>, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ sucesso: false, erro: "ID inválido" } as ApiResponse<null>);
      return;
    }
    const removida = await TarefaModel.remover(id);
    if (!removida) {
      res.status(404).json({ sucesso: false, erro: "Tarefa não encontrada" } as ApiResponse<null>);
      return;
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ sucesso: false, erro: "Erro interno" });
  }
}