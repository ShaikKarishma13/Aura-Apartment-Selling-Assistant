from services.transcription_service import transcribe_audio

result = transcribe_audio(
    r"C:\Aura-Clean\recordings\call1.mp3"
)

print("\nTRANSCRIPT:\n")
print(result)