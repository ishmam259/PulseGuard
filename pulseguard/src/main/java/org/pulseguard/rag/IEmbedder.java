package org.pulseguard.rag;

public interface IEmbedder {
    public float[] embed(String text) throws Exception;
}
